#include "ProtonClient.h"
#include <proton/connection_options.hpp>
#include <proton/reconnect_options.hpp>
#include <proton/work_queue.hpp>
#include <iostream>
#include <chrono>

namespace mq{

ProtonClient::ProtonClient(std::string const& address, std::string const& senderAddress, std::string const& receiverAddress) :
connectionAddress(address), senderAddress(senderAddress), receiverAddress(receiverAddress) {}

void ProtonClient::runThread() {
	std::cout << "Starting proton client...\n";
	containerThread = std::thread([&] { this->container.run(); });

	auto reconnectOptions = proton::reconnect_options()
		.max_delay(proton::duration(2000))
		.max_attempts(0);

	auto connectionOptions = proton::connection_options()
		.reconnect(reconnectOptions)
		.handler(*this);

	this->container.open_receiver(connectionAddress + '/' + receiverAddress, connectionOptions);
	this->container.open_sender(connectionAddress + '/' + senderAddress, connectionOptions);

	workerThreads.push_back(std::thread([&] {
		while (true) {
			auto msg = receiveSync();
			for (auto& l : listeners) {
				l(msg);
			}
		}
	}));
	std::cout << "Proton client started\n";
}

void ProtonClient::on_receiver_open(proton::receiver& receiver) {
	this->receiver = receiver;
	std::scoped_lock lock(receiverLock);
	this->recvWorkQueue = &receiver.work_queue();
}

void ProtonClient::on_sender_open(proton::sender& sender) {
	this->sender = sender;
	std::scoped_lock lock(senderLock);
	this->sendWorkQueue = &sender.work_queue();
}

void ProtonClient::on_message(proton::delivery& d, proton::message& msg) {
	recvBuffer.push(msg);
	canRecv.notify_all();
}

void ProtonClient::close() {
	for (auto& th : workerThreads) {
		th.join();
	}
	sender.close();
	receiver.close();
	containerThread.join();
}

proton::message ProtonClient::receiveSync() {
	std::unique_lock lock(receiverLock);
	while (!recvWorkQueue || recvBuffer.empty()) {
		canRecv.wait(lock);
	}
	proton::message msg = std::move(recvBuffer.front());
	recvBuffer.pop();
	return msg;
}

void ProtonClient::on_sendable(proton::sender& sender) {
	canSend.notify_all();
}

void ProtonClient::sendSync(proton::message const& msg) {
	std::unique_lock lock(senderLock);
	canSend.wait(lock, [&] {return sendWorkQueue; });
	sendWorkQueue->add([this,msg]() {
		send(msg);
	});
}

void ProtonClient::send(proton::message const& msg) {
	sender.send(msg);
	canSend.notify_all();

}

void ProtonClient::addMessageListener(ListenerFnc f) {
	listeners.push_back(f);
}
}