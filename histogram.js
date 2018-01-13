
/**
 * Creating the barchart for the histogram value using d3.js
 */

var vmax = 640;
var hmax = 480;

var w = {min: 5 ,max: vmax };
var h = {min: 5 ,max: hmax };
var widthrange = [w.min,w.max];
var heightrange = [h.min,h.max];
var colorrange = ["#000","#eee"];

var hlin = d3.scaleLinear() /// Creates a linear scale for the histogram values.
        .range(heightrange);
var hlog = d3.scaleLog() /// Creates a log scale for the histogram values.
        .range(heightrange);
var clin = d3.scaleLinear()  /// Creates a log scale for the histogram color.
        .range(colorrange);

var svg = d3.select("#histogram figure") /// Selects the The html tag.
        .insert("svg",'figcaption')       /// Append svg
        .attr("viewBox", "0 0 "+vmax+" "+hmax);/// Dynamically resizes the svg image.
// .attr("class", "img-fluid")        /// Dynamically resizes the svg image.
// .attr("width", "100%")             /// Dynamically resizes the svg image.


function update_barchart(obj){

    // console.log(console.log("called"));

    var dataset=obj.histo.data;
    var dnumber=dataset.length;
    
    dataset = dataset.map(x => x+1); /// Avoids logscale issues.

    
    
    var dom=d3.extent(dataset);

    var hscale = d3.select("#log").property("checked")
	    ? hlog.domain(dom) : hlin.domain(dom);

    var cscale = clin.domain([0,dnumber-1]);

    // var aspect = w.max / h.max,
    // 	chart = d3.select('#chart');
    // d3.select(window)
    // 	.on("resize", function() {
    // 	    var targetWidth = chart.node().getBoundingClientRect().width;
    // 	    chart.attr("width", targetWidth);
    // 	    chart.attr("height", targetWidth / aspect);
    // 	});


    /// Adding a rectangle (bar) for each histogram value
    var elem = svg.selectAll("rect")
	    .data(dataset);

    elem
	.enter()
	.append("rect");

    elem
    	.attr("x", (d,i) => i * (w.max / dnumber) )
	.attr("y", d =>  h.max-hscale(d)+1 )
	.attr("width", w.max / dnumber )
	.attr("height", d => hscale(d)+1 )
	.attr("fill", (d,i) => cscale(i) );

    elem
	.exit()
	.remove();

    /// Adding Labels
    var labs = svg.selectAll("text")
	    .data(dataset);

    labs
	.enter()
	.append("text");

    labs
	.text( (d,i) => i % (dnumber/10) == 4 ? d : null )
	.attr("text-anchor", "middle")
    	.attr("x", (d,i) => i * (w.max / dnumber) )
	.attr("y", d =>  h.max-hscale(d) - 16  )
	.attr("font-family", "sans-serif")
	.attr("font-size", "1.3em")
	.attr("fill", "steelblue");

    labs
	.exit()
	.remove();

} /// update_barchart

