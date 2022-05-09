#pragma once
#include <proton/messaging_handler.hpp>
#include <proton/container.hpp>
#include <proton/receiver.hpp>
#include <proton/sender.hpp>
#include <proton/message.hpp>
#include <string>
#include <mutex>
#include <queue>
#include <thread>
#include <functional>
#include <condition_variable>

namespace mq{

class ProtonClient : public proton::messaging_handler {
public:
	using ProducerFnc = std::function<proton::message()>;
	using ListenerFnc = std::function<void(proton::message)>;

	ProtonClient(std::string const& address, std::string const& senderNode, std::string const& receiverNode);
	ProtonClient(ProtonClient&&) = delete;
	ProtonClient(ProtonClient&) = delete;
	ProtonClient& operator=(ProtonClient&) = delete;
	ProtonClient& operator=(ProtonClient&&) = delete;

	void runThread();
	void close();
	void addMessageListener(ListenerFnc);
	void sendSync(proton::message const& msg);
private:
	proton::container container;
	proton::work_queue* sendWorkQueue = nullptr;
	proton::work_queue* recvWorkQueue = nullptr;
	proton::receiver receiver;
	proton::sender sender;
	std::string connectionAddress;
	std::string senderAddress;
	std::string receiverAddress;
	std::thread containerThread;

	mutable std::mutex senderLock;
	mutable std::mutex receiverLock;
	mutable std::condition_variable canSend;
	mutable std::condition_variable canRecv;

	std::vector<std::thread> workerThreads;
	std::queue<proton::message> recvBuffer;
	std::vector<ListenerFnc> listeners;
	
	void send(proton::message const&);
	proton::message receiveSync();

	//proton event handlers
	void on_receiver_open(proton::receiver&) override;
	void on_sender_open(proton::sender&) override;
	void on_message(proton::delivery&, proton::message&) override;
	void on_sendable(proton::sender&) override;

};
}