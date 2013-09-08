define(function (require) { 
	 require(["./classa"],function (){
	 require(["./partials/test.tpl.html"],function (){
	 require(["./deep/classb",
		  "./deep/classc"],function (){
	 require(["./deep/deeper/classd"],function (){
	 require(["./app"],function (){

	 });
	 });
	 });
	 });
	 });
});