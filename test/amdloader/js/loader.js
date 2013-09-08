define(function (require) { 
	 require(["./classa"],function (){
	 require(["./deep/classb",
		  "./deep/classc"],function (){
	 require(["./deep/deeper/classd"],function (){
	 require(["./app"],function (){

	 });
	 });
	 });
	 });
});