package app.solver;

public class AllDifferentConstraint extends Constraint{
	private Iterable<String> indices;
	public AllDifferentConstraint(Iterable<String> indices) {
		this.indices = indices;
	}

	@Override
	public String stringify() {
		var sb = new StringBuilder();
		sb.append("constraint alldifferent(").append(getIndexArray(indices)).append(");");
		return sb.toString();
	}

}
