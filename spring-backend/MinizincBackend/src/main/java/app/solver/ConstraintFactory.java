package app.solver;

import java.util.Map;

public class ConstraintFactory {
	
	public static Constraint create(Map<String, Object> settings, Iterable<String> indices) {
		var name = (String)settings.get("constraint");
		if(name.equals("count")) {
			var amount = (int) settings.get("amount");
			var countedValue = (int) settings.get("countedValue");
			var relation = (String) settings.get("relation");
			return new CountConstraint(amount, countedValue, relation, indices);
		}
		else if(name.equals("alldifferent")) {
			return new AllDifferentConstraint(indices);
		}
		return null;
	}
}
