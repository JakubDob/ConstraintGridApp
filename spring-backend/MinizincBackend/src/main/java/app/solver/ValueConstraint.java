package app.solver;

import java.util.HashMap;
import java.util.Map;

public class ValueConstraint extends Constraint{
	private Map<String, String> singleValueConstraints;
	public ValueConstraint(Map<String,Object> singleValueConstraints) {
		this.singleValueConstraints = new HashMap<String,String>();

		for(var v : singleValueConstraints.entrySet()) {
			var key = v.getKey();
			var val = v.getValue();
			if(!key.equals("") && !val.equals("")) {
				this.singleValueConstraints.put(key,val.toString());
			}
		}
	}

	@Override
	public String stringify() {
		var sb = new StringBuilder();
		for(var v : singleValueConstraints.entrySet()) {
			sb.append("constraint ");
			sb.append(this.getSingleValue(v.getKey())).append("=").append(v.getValue());
			sb.append(";\n");
		}
		return sb.toString();
	}

}
