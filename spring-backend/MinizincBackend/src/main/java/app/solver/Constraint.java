package app.solver;
public abstract class Constraint {
	protected static String arrayName = "q";

	public String getIndexArray(Iterable<String> indices) {
		var sb = new StringBuilder();
		sb.append('[');
		var it = indices.iterator();
		while(it.hasNext()) {
			sb.append(arrayName).append('[').append(it.next()).append(']');
			if(it.hasNext()) {
				sb.append(',');
			}
		}
		sb.append(']');
		return sb.toString();
	}
	public String getSingleValue(String index) {
		return arrayName+"["+index+"]";
	}
	
	public abstract String stringify();
	public static String getArrayName() {
		return arrayName;
	}
}
