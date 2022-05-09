package app.solver;

import java.util.ArrayList;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.lang.Nullable;

public class ModelParser {

	public class Solution{
		private String data;
		private String id;
		public Solution(String id, String data) {
			this.data = data;
			this.id = id;
		}
		public String getData() {
			return this.data;
		}
		public String getId() {
			return this.id;
		}
	}
	public @Nullable Solution parseSolution(String jsonSolution) {
		try {
			var jsonObj = new JSONObject(jsonSolution);
			var data = jsonObj.getString("data");
			var id = jsonObj.getLong("id");
			return new Solution(Long.toString(id),data);
		}
		catch(JSONException e) {
			e.printStackTrace();
			return null;
		}
	}

	public String parseJsonModel(String jsonModel) {
		var constraints = new ArrayList<Constraint>();
		var jsonObj = new JSONObject(jsonModel);
		var minValue = jsonObj.getInt("minValue");
		var maxValue = jsonObj.getInt("maxValue");
		var cols = jsonObj.getInt("cols");
		var rows = jsonObj.getInt("rows");
		var solvingMethod = jsonObj.getString("solvingMethod");
		var contentMap = jsonObj.getJSONObject("content").toMap();
		constraints.add(new ValueConstraint(contentMap));
		var constrObj = jsonObj.getJSONObject("constraints");
		constrObj.keys().forEachRemaining(cId->{
			var singleConstrObj = constrObj.getJSONObject(cId);
			var viewsObj = singleConstrObj.getJSONObject("views");
			viewsObj.keys().forEachRemaining(vId->{
				var singleViewObj = viewsObj.getJSONObject(vId);
				var settings = singleViewObj.getJSONObject("settings").toMap();
				var groupsObj = singleViewObj.getJSONObject("groups");
				groupsObj.keys().forEachRemaining(gId->{
					var singleGroupObj = groupsObj.getJSONObject(gId);
					var indicesObj = singleGroupObj.getJSONArray("indices");
					var indicesList = new ArrayList<String>();
					for(var i : indicesObj) {
						indicesList.add(i.toString());
					}
					constraints.add(ConstraintFactory.create(settings, indicesList));
				});
			});
		});

		StringBuilder sb = new StringBuilder();
		sb.append("array [0..").append((rows*cols) - 1).append("] of var ")
		.append(minValue).append("..")
		.append(maxValue).append(":")
		.append(Constraint.arrayName).append(";\n");
		sb.append("include \"globals.mzn\";\n");
		constraints.forEach(c->{
			sb.append(c.stringify()).append("\n");
			System.out.println(c.stringify());
		});
		sb.append("solve ");
		sb.append(solvingMethod);			
		if(!solvingMethod.equals("satisfy")) {
			sb.append(" sum("+Constraint.arrayName+")");
		}
		sb.append(";\n");			
		sb.append("output[");
		sb.append("show(").append(Constraint.arrayName).append(")];");
		return sb.toString();
	}
}
