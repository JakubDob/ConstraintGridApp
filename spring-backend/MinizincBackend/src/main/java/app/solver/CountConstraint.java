package app.solver;

public class CountConstraint extends Constraint {
	private int amount;
	private int countedValue;
	private String relation;
	private Iterable<String> indices;
	
	public CountConstraint(int amount, int countedValue, String relation, Iterable<String> indices) {
		this.amount = amount;
		this.countedValue = countedValue;
		this.relation = relation;
		this.indices = indices;
	}

	@Override
	public String stringify() {
		var sb = new StringBuilder();
		sb.append("constraint count(")
		.append(this.getIndexArray(this.indices))
		.append(",")
		.append(countedValue)
		.append(")")
		.append(relation)
		.append(amount)
		.append(";");
		
		return sb.toString();
	}
	
}
