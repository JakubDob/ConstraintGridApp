package app.api;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import app.qpid.QpidClient;
import app.solver.ModelParser;
import app.solver.ModelParser.Solution;
import app.solver.ProblemInstance;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

@RestController
@RequestMapping(path="/api", produces="text/event-stream")
public class SolverRestController {
	
	@Autowired
	private QpidClient qpidClient;
	@Autowired
	private ModelParser modelParser;
	private Flux<Solution> solutions;
	private Sinks.Many<Solution> solutionSink;
	
	@PostConstruct
	public void convertMessages() {
		this.solutionSink = Sinks.many().multicast().onBackpressureBuffer();
		qpidClient.getFlux().subscribe(msg->{
			var solution = modelParser.parseSolution((String) msg);
			System.out.format("Solution id: %s\n", solution.getId());
			this.solutionSink.tryEmitNext(solution);
		});

		this.solutions = this.solutionSink.asFlux();
		this.solutions.subscribe();
	}

	@GetMapping("/model")
	public Flux<String> sendSolutions(@RequestParam String userId) {
		System.out.format("User %s subscribed to the solution stream\n", userId);
		return solutions
				.filter(s-> s.getId().equals(userId))
				.map(s-> s.getData())
				.doOnNext(System.out::println);
	}

	@PostMapping("/model")
	public Mono<ResponseEntity<String>> postModel(@RequestBody String body, @RequestParam String userId) {
		var subCount = this.solutionSink.currentSubscriberCount();
		System.out.format("User %s posted a model. Subscriber count: %d\n", userId, subCount);
		var model = modelParser.parseJsonModel(body);
		var instance = new ProblemInstance(model, Long.parseLong(userId));
		qpidClient.send(instance.toString());
		
		return Mono.just(ResponseEntity.ok().build());
	}
}
