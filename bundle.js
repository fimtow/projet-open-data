(function (d3,topojson) {
    'use strict';
    const height = 500;
    const width = 960;
    let year = 2021;
    const numyears = 5;
    const cury = 2021;
    const parameters = ["pm25","o3","co","no2","so2","pm1","um010","um025","um100"]
    let parameter = 0;
    const svg = d3.select('svg').attr('width',width).attr('height',height);
  
    const projection = d3.geoNaturalEarth1().scale(200).translate([width/2.2,height/1.75]);
    const pathGenerator = d3.geoPath().projection(projection);
  
    const g = svg.append('g');
  
    svg.call(d3.zoom().on('zoom', () => {
      g.attr('transform', d3.event.transform);
    }));
  
    Promise.all([
      d3.tsv('https://unpkg.com/world-atlas@1.1.4/world/50m.tsv'),
      d3.json('https://api.jsonbin.io/b/61520874aa02be1d444fccb1'),
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
                "color": pickHex([20, 0, 0],[255, 0, 0],value/theMax)
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



    const selectl = d3.select('.apmap').append("select").attr('class','selectapmap').on('change',onchange);
    selectl.selectAll("option").data(parameters).enter().append("option").text(d=>d);
    function onchange() {
        parameter = selectl.property('selectedIndex');
        console.log(parameter);
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
        .width(300)
        .tickFormat(d3.timeFormat('%Y'))
        .tickValues(dataTime)
        .default(new Date(cury, 10, 3))
        .on('onchange', val => {
          year = d3.timeFormat('%Y')(val);
          g.selectAll('path').data(countries.features)
          .style('fill',d=> 'rgb('+value(year,parameter,d.id).color.join()+')')
        .selectAll('title')
        .text(d => value(year,parameter,d.id).text);
        });
        d3.select('#slider')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)')
    .call(slider);
        /*
    const ysilder = d3.select('.apmap').append("slider").on('change',onchangeYear).attr('min',cury-numyears)
    .attr('max',cury).attr('value',numyears);
    function onchangeYear() {
        year = yslider.property('value');
        console.log(parameter);
        g.selectAll('path').data(countries.features)
          .style('fill',d=> 'rgb('+value(year,parameter,d.id).color.join()+')')
        .selectAll('title')
        .text(d => value(year,parameter,d.id).text);
    }*/
    });
  }(d3,topojson));
  
