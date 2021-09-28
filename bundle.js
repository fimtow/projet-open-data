(function (d3,topojson) {
    'use strict';
    const height = 500;
    const width = 960;
    let year = 2021;
    const numyears = 5;
    const cury = 2021;
    const parameters = ["pm25","pm10","pm1","o3","co","no2","so2"]
    let parameter = 0;
    const svg = d3.select('svg').attr('width',width).attr('height',height);
  
    const projection = d3.geoNaturalEarth1().scale(200).translate([width/2.2,height/1.75]);
    const pathGenerator = d3.geoPath().projection(projection);
  
    const g = svg.append('g');
  /*
    svg.call(d3.zoom().on('zoom', () => {
      g.attr('transform', d3.event.transform);
    }));*/
    let zoom = d3.zoom().on("zoom", zoomed);
    svg.call(zoom).on("dblclick.zoom", null);
    d3.select("#zoom_in").on("click", function() {
    zoom.scaleBy(svg.transition().duration(750), 2);
    });
    d3.select("#zoom_out").on("click", function() {
    zoom.scaleBy(svg.transition().duration(750), 0.5);
    });

function zoomed() {
    g.attr("transform", d3.event.transform);
}
  
    Promise.all([
      d3.tsv('https://unpkg.com/world-atlas@1.1.4/world/50m.tsv'),
      //d3.json('https://api.jsonbin.io/b/61520874aa02be1d444fccb1'),
      //d3.json('https://api.jsonbin.io/b/6152dafb4a82881d6c56e255'), latest
      d3.json('https://api.jsonbin.io/b/6152dd7f4a82881d6c56e552'),
      d3.json('https://unpkg.com/world-atlas@1.1.4/world/50m.json')
    ]).then(([tsvData, avgData, topoJSONdata]) => {
        const countryName = tsvData.reduce((accumulator, d) => {
            accumulator[d.iso_n3] = d.iso_a2;
            return accumulator;
          }, {});

function maxValue()
{
    let max = -1;
    avgData.forEach(e => {
        if(e.parameter == parameters[parameter] && e.year.substring(0,4) == year)
        {
            if(max == -1)
            {
                max = e.average;
            }
            else if(e.average > max)
            {
                max = e.average;
            }
        }
    });
    return max
}
function pickHex(color1, color2, weight) {
    var w1 = weight;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return rgb;
}
let theMax = maxValue();
updateGradient();

function updateGradient()
{
    d3.select(".max-value").text(theMax+" µg/m³");
    d3.select(".min-value").text("0 µg/m³");
}
function value(year,parameter,country) {
    let cn = countryName[country];
    let avg = {
        "value": -1,
        "text": "no data",
        "color": [175, 179, 175]
    }
    avgData.forEach(e => {
        if(e.parameter == parameters[parameter] && e.year.substring(0,4) == year && e.name == cn)
        {
            let value = e.average > 0 ? e.average : 0;
            avg = {
                "value": value,
                "text": e.subtitle+": "+value+" "+e.unit+" ("+e.displayName+")",
                "color": pickHex([217, 49, 39],[246, 225, 158],value/theMax)
            };
        }
    });
    return avg;
}

console.log(theMax);

      const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);
      g.selectAll('path').data(countries.features)
        .enter().append('path')
          .attr('class', 'country')
          .attr('d', pathGenerator)
          .style('fill',d=> 'rgb('+value(year,parameter,d.id).color.join()+')')
        .append('title')
        .text(d => value(year,parameter,d.id).text);



    const selectl = d3.select('.selectapmap').on('change',onchange);
    selectl.selectAll("option").data(parameters).enter().append("option").text(d=>d);
    function onchange() {
        parameter = selectl.property('selectedIndex');
        theMax = maxValue();
        updateGradient();
        console.log(theMax);
        g.selectAll('path').data(countries.features)
          .style('fill',d=> 'rgb('+value(year,parameter,d.id).color.join()+')')
        .selectAll('title')
        .text(d => value(year,parameter,d.id).text);
    }
    var dataTime = d3.range(0, numyears).map(function(d) {
        return new Date(cury - d, 10, 3);
      });
    
      var slider = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365)
        .width(200)
        .tickFormat(d3.timeFormat('%Y'))
        .tickValues(dataTime)
        .default(new Date(cury, 10, 3))
        .on('onchange', val => {
          year = d3.timeFormat('%Y')(val);
          theMax = maxValue();
          updateGradient();
          console.log(theMax);
          g.selectAll('path').data(countries.features)
          .style('fill',d=> 'rgb('+value(year,parameter,d.id).color.join()+')')
        .selectAll('title')
        .text(d => value(year,parameter,d.id).text);
        });
        d3.select('#slider')
    .append('svg')
    .attr('width', 300)
    .attr('height', 90)
    .append('g')
    .attr('transform', 'translate(30,30)')
    .call(slider);
    });
  }(d3,topojson));
  
