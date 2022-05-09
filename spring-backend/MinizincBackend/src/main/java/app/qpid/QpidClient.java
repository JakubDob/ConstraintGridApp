package app.qpid;

import javax.annotation.PreDestroy;
import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.DeliveryMode;
import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageConsumer;
import javax.jms.MessageProducer;
import javax.jms.Session;
import javax.jms.TextMessage;
import javax.naming.InitialContext;
import javax.naming.NamingException;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

public class QpidClient {
	private Session session;
	private Connection connection;
	private MessageConsumer consumer;
	private MessageProducer producer;
	private final Sinks.Many<String> sink;
	private Thread receiverThread;
	private boolean shouldStopReceiving = false;
	private boolean connected = false;
	
	private static QpidClient instance = null;
	
	public static QpidClient getInstance() {
		if(instance == null) {
			instance = new QpidClient();
		}
		return instance;
	}
	private QpidClient() {
		this.sink = Sinks.many().unicast().onBackpressureBuffer();
	}
	
	public boolean connect() {
		if(connected) {
			return true;
		}
		try {
			System.out.println("Starting QpidClient.");
			var context = new InitialContext();
			var connectionFactory = (ConnectionFactory) context.lookup("myFactoryLookup");
			this.connection = connectionFactory.createConnection(System.getProperty("USER"), System.getProperty("PASSWORD"));
			this.connection.start();
			this.session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
			this.consumer = session.createConsumer((Destination) context.lookup("consumerQueue"));
			this.producer = session.createProducer((Destination) context.lookup("producerQueue"));
			this.receiverThread = new Thread(()->{ receiveMessageThread(); });
			this.receiverThread.start();
			this.connected = true;
			return true;
		} catch (NamingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		} catch (JMSException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		}
	}
	
	private void receiveMessageThread() {
		while(!shouldStopReceiving) {
			try {
				var msg = (TextMessage)consumer.receive();
				if(msg != null) {
					sink.tryEmitNext(msg.getText());					
				}
				else {
					System.out.println("QpidClient message is null");
				}
			} catch (JMSException e) {
				// TODO Auto-generated catch block
				System.out.println("debug; receiveMessageThread exception:");
				e.printStackTrace();
				shouldStopReceiving = true;
			}	
		}
		System.out.println("QpidClient receiveMessageTread exited");
	}

	public Flux<String> getFlux(){
		return this.sink.asFlux();
	}

	public void send(String message) {
		try {
			var msg = session.createTextMessage(message);
			System.out.println("QpidClient send: "+message);
			producer.send(msg, DeliveryMode.PERSISTENT, Message.DEFAULT_PRIORITY, Message.DEFAULT_TIME_TO_LIVE);	
		}
		catch(JMSException e) {
//			 TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	@PreDestroy
	public void stop() {
		System.out.println("Closing QpidClient");
		shouldStopReceiving = true;
		try {
			connection.close();
			System.out.println("QpidClient Connection closed");
		} catch (JMSException e) {
//			 TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			receiverThread.join();
		}
		catch(InterruptedException e) {
			receiverThread.interrupt();
		}

	}
	
}
