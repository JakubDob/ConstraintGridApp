package app.solver;

import org.json.JSONObject;

public class ProblemInstance {
	private final JSONObject jo;
	private final long id;
	private final String model;
	private String data;
	
	public ProblemInstance(String model, long id) {
		this(model,id,"");
	}
    public ProblemInstance(String model, long id, String data){
        this.id = id;
        this.model = model;
        this.data = data;
        
        jo = new JSONObject();
        jo.put("id", this.id);
        jo.put("data", this.data);
        jo.put("model", this.model);
    }
    public String toString() {
    	return jo.toString();
    }

    public void setData(String newData) {
    	this.data = newData;
    }
    
    public long getId() {
    	return this.id;
    }
    
    public boolean equals(ProblemInstance o) {
    	if(o == this) { return true; }
    	if(!(o instanceof ProblemInstance)) { return false; }
    	return o.id == this.id;
    }
}
