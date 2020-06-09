import express from "express";
import {promises} from "fs";
import winston from 'winston';

const readFile = promises.readFile;
const writeFile = promises.writeFile;

const router = express.Router();

const app = express();
app.use(express.json());

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({level, message, label, timestamp}) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
global.logger = winston.createLogger({
  level: "silly",
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'trabalho-Modulo2.log' }),
  ],
  format: combine(
    label({ label: "trabalho-Modulo2-api"}),
    timestamp(),
    myFormat
  )
});

app.listen(3000, async () => {
  try{   
      start(); //Item 1 - Criação de json por UF
      city(); //Item 2 - Quantidade de cidades por UF 
      StatesWithManyCities(); //Item 3 e 4 - Mostrar 5 Estados com maior e menor quantidade de cidades
      cityBiggestByUf(); //Item 5 - Maior Nome de cidades por UF
      citySmallestByUf(); //Item 6 - Menor Nome de cidades por UF
      cityBiggestGeral(); //Item 7 - Maior nome de cidade Geral
      citySmallestGeral(); //Item 8 - Menor nome de cidade Geral
      logger.info('api started');
      
     }catch(err){
        logger.err('erro cath listen', err.message);   
  }    
});

async function start(){
  let dataCity = await readFile('./json/Cidades.json', 'utf8');
  let dataState = await readFile('./json/Estados.json', 'utf8');
  
  let jsonCity = JSON.parse(dataCity);
  let jsonStates = JSON.parse(dataState);

  jsonStates.forEach(state =>{
    let city = jsonCity.filter(function(city){
      return city.Estado == state.ID;       
    });     
    
    let newJson = [{city}]
    createFileJson(state.Sigla, newJson);
  });
  
  async function createFileJson(state, newJson){
    await writeFile(`./json/${state}.json`, JSON.stringify(newJson));  
    logger.info(`Create fileJson with Sucess  ${JSON.stringify(newJson)}`);    
  }
}

async function StatesWithManyCities(){  
  let dataState = await readFile('./json/Estados.json', 'utf8'); 
  let jsonStates = JSON.parse(dataState);
  let newJson = [];
  let qtd = 0;
  jsonStates.forEach(async state => {         
      qtd = await quantityCities(state.Sigla);  
      
      newJson.push({state: state.Sigla, QtdCities: qtd});
      const orderedListMaior = newJson.sort((a, b) => a.QtdCities > b.QtdCities ? -1 : 1 ); 
      console.log('Estados com mais cidades', orderedListMaior.slice(0, 5));

      const orderedListMenor = newJson.sort((a, b) => a.QtdCities - b.QtdCities);
      console.log('Estados com Menos cidades', orderedListMenor.slice(0, 5));
  });     
}

async function quantityCities(uf){
  let dataUF = await readFile(`./json/${uf}.json`, 'utf8');
  let jsonDataUF = JSON.parse(dataUF);
  const quantity = jsonDataUF.length;
  return quantity;   
}

async function city (){
  var uf = 'MG';
  let qtd = await quantityCities(uf);
  console.log(uf + ' tem',qtd);
}

async function cityBiggestByUf() {
  let dataState = await readFile('./json/Estados.json', 'utf8'); 
  let jsonStates = JSON.parse(dataState);
  let newJson = [];  

  jsonStates.forEach(async state => {   
    let data = await readFile(`./json/${state.Sigla}.json`, 'utf8');   
    let jsonData = JSON.parse(data); 
     
    jsonData.sort((a, b) => {
      if(a.Nome.length < b.Nome.length){
        return 1;
      }
      else if(a.Nome.length > b.Nome.length){
        return -1;
      }        
     return 0;
    }); 
    newJson.push({state: state.Sigla, name:jsonData[0].Nome });
    console.log('A Maior Cidade do Estado', newJson); 
  });    
}

async function citySmallestByUf() {
  let dataState = await readFile('./json/Estados.json', 'utf8'); 
  let jsonStates = JSON.parse(dataState);
  let newJson = [];

  jsonStates.forEach(async state => {   
    let data = await readFile(`./json/${state.Sigla}.json`, 'utf8');   
    let jsonData = JSON.parse(data);
     
    jsonData.sort((a, b) => {
      if(a.Nome.length > b.Nome.length){
        return 1;
      }
      else if(a.Nome.length < b.Nome.length){
        return -1;
      }        
     return 0;
    });     

    newJson.push({state: state.Sigla, name:jsonData[0].Nome });
    console.log('A Menor Cidade do Estado', newJson); 
  });   
  
}

async function cityBiggestGeral() {        
  let dataState = await readFile('./json/Estados.json', 'utf8'); 
  let jsonStates = JSON.parse(dataState);
  let dataCity = await readFile('./json/Cidades.json', 'utf8');  
  let jsonCity = JSON.parse(dataCity); 
          
          jsonCity.sort((a, b) => {
            if(a.Nome.length > b.Nome.length){
              return -1;
            }
            else if(a.Nome.length < b.Nome.length){
              return 1;
            }        
           return 0;
          }).sort((a, b) => 
          b.Nome.localeCompare(a.Nome)).sort((a, b) => 
              b.Nome.length - a.Nome.length);; 

  const searchState = jsonStates.filter(state => jsonCity[0].Estado === state.ID);  
  const biggestCity = {...searchState, ...jsonCity[0]};          
  console.log('Maior Cidade Geral: ',biggestCity);     
}

async function citySmallestGeral() {        
  let dataState = await readFile('./json/Estados.json', 'utf8'); 
  let jsonStates = JSON.parse(dataState);
  let dataCity = await readFile('./json/Cidades.json', 'utf8');  
  let jsonCity = JSON.parse(dataCity); 

  jsonCity.sort((a, b) => {
    if(a.Nome.length > b.Nome.length){
      return 1;
    }
    else if(a.Nome.length < b.Nome.length){
      return -1;
    }        
   return 0;
  }).sort((a, b) => 
  a.Nome.localeCompare(b.Nome)).sort((a, b) => 
      a.Nome.length - b.Nome.length);    

  const searchState = jsonStates.filter(state => jsonCity[0].Estado === state.ID);  
  const smallestCity = {...searchState, ...jsonCity[0]};          
  console.log('Menor Cidade Geral: ', smallestCity);     
}



