#include <iostream>
#include <queue>
#include <boost/process.hpp>
#include <nlohmann/json.hpp>
#include "ProtonClient.h"

namespace bp = boost::process;

namespace mq{
	std::mutex m;
	std::condition_variable cv;
	using id_t = long long unsigned;
	using json = nlohmann::json;
	struct ParsedMsg {
		bool valid = true;
		id_t id = 0;
		std::string data;
		std::string error;
	};

	class OutputMsg {
	public:
		OutputMsg(id_t id, std::string data) : id(id), data(data){}

		std::string toJson() {
			json j;
			j["id"] = id;
			j["data"] = data;
			auto output = j.dump();
			output.erase(std::remove_if(output.begin(), output.end(), [](char const c){
				//TODO: modify minizinc output string from '======' to something else
				return (c == ' ' || c == '\\' || c == 'r' || c == '-');
			}), output.end());

			return output;
		}

		std::string data;
		id_t id;
	};
	/*
	{
		"id": 12345,
		"model": "int: n;\noutput[\"Hello world! Value of n = \\(n)\"]",
		"data": "n=5;"
	}
	*/
	ParsedMsg parseMsg(proton::message const& msg) {
		ParsedMsg md;
		std::string body = get<std::string>(msg.body());
		std::cout << "Message body: " << body << "\n";
		json j;
		try {
			j = json::parse(body);
		}
		catch (std::exception& e) {
			std::cerr << e.what() << "\n";
			md.valid = false;
			return md;
		}

		if (j.contains("id")) {
			md.id = j["id"].get<id_t>();
		}
		else {
			md.valid = false;
			md.error = "Missing id";
			return md;
		}
		if (!j.contains("model")) {
			md.valid = false;
			md.error = "Missing model";
			return md;
		}
		if (j.contains("data")) {
			md.data = j["data"].get<std::string>() + "\n" + j["model"].get<std::string>();
		}
		else {
			md.data = j["model"].get<std::string>();
		}
		return md;
	}
	std::string cmdVecToStr(std::vector<std::string> const& input) {
		std::string output = "";
		for (auto& param : input) {
			output += param + " ";
		}
		return output;
	}
}

int main(int argc, const char** argv) {
	if(argc < 3){
		throw std::runtime_error("Provide the broker, sender and receiver addresses");
	}
	using namespace mq;
	std::queue<ParsedMsg> messages;
	// ProtonClient pc("localhost:61616", "SolverAddress::solutions", "SolverAddress::models");
	ProtonClient pc(argv[1], argv[2], argv[3]);
	pc.addMessageListener([&](proton::message msg) {
		std::cout << "\nPushing a message to the queue!\n";
		auto pm = parseMsg(msg);
		messages.push(pm);
		cv.notify_one();
	});
	pc.runThread();

	std::vector<std::string> cmd = {
		"minizinc"
		,"--input-from-stdin"
		,"--search-complete-msg \"\""
		,"--solver-time-limit 10000"
		,"--parallel 4"
	};

	std::string params = cmdVecToStr(cmd);

	while (true) {
		bp::ipstream pipeOutStream;
		bp::opstream pipeInStream;
		std::unique_lock lock(m);
		cv.wait(lock, [&] { return !messages.empty(); });
		auto pm = messages.front();
		messages.pop();
		if (pm.valid) {
			std::cout << "solving:\n" << pm.data << "\n";

			bp::child c(params, bp::std_out > pipeOutStream, bp::std_in < pipeInStream);
			pipeInStream << pm.data << std::flush;
			pipeInStream.pipe().close();
			std::string line, fullMsg;
			while (pipeOutStream && getline(pipeOutStream, line) && !line.empty()) {
				fullMsg += line;
			}
			if (fullMsg.empty()) {
				fullMsg = "Model error";
			}
			OutputMsg output(pm.id, fullMsg);
			std::cout << "The json response: " << output.toJson();
			auto msg = proton::message(output.toJson());
			msg.durable(true);
			pc.sendSync(msg);
			c.wait();
		}
		else {
			std::cerr << "error, invalid format: " << pm.error << "\n";
		}
	}
	pc.close();
	std::cout <<"Client closed\n";
}
