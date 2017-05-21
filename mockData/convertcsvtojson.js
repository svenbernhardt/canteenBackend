let csv = require('csvtojson');
let fs = require('fs');

csv()
    .fromString(fs.readFileSync('mockData/gerichte.csv'))
    .on('csv',(csvRow)=>{ // this func will be called 3 times
        console.log(csvRow); // => [1,2,3] , [4,5,6]  , [7,8,9]
    })
    .on('done',()=>{
        //parsing finished
    });