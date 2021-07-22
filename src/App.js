import { MenuItem, FormControl, Select, Card ,CardContent} from '@material-ui/core';
import './App.css';
import React,{useState ,useEffect} from "react";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import {prettyPrintStat, sortData} from "./util";
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";

function App() {
  /*USEEFFECT = Runs a piece of code based on a given condition */
  const [countries , setCountries]=useState([]);
  const [country , setCountry]=useState('worldwide');
  const [countryInfo,setCountryInfo]=useState({});
  const [tableData,setTableData]=useState([]);
  const [mapZoom, setMapZoom] = useState(4);
  const [mapCenter, setMapCenter] = useState({ lat:20.5937 , lng: 78.9629});

  const [casesType ,setCasesType] =useState("cases");


  const [mapCountries,setMapCountries] = useState([]);
  useEffect(() => {

      fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) =>{
        setCountryInfo(data);
      })

  } ,[])


  useEffect(() => {
  
      const getCountriesData=async() =>{
        await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
          .then((data) =>{
            const countries =data.map((country) => (
              {
                name: country.country,
                value:country.countryInfo.iso2,
              }));

              const sortedData= sortData(data);

            setCountries(countries);
            setTableData(sortedData);
            setMapCountries(data);
           
      });
  };
         
  getCountriesData();

}, [])  ;


      const onCountryChange =async(event)=>{
        const countryCode=event.target.value;
        setCountry(countryCode);

        const url =countryCode ==='worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`
          await fetch(url).then((response) => response.json())
          .then(data =>{
           
      
              setCountryInfo(data);
              setMapCenter([data.countryInfo.lat,data.countryInfo.long]);
              setMapZoom(4);
              console.log(data);
          });

      };

  return (
    <div className="app">
    <div className="app__left">
    <div className="app__header">

    <h1>COVID 19 TRACKER</h1>
      <FormControl className="app__dropdown">
        <Select
       
        varient="outlined"

        onChange={onCountryChange}
        value={country}
        >
         <MenuItem value="worldwide"> Worldwide
        </MenuItem>
         {
           countries.map(country =>(
             <MenuItem value={country.value}>{country.name}</MenuItem>
           ))
         }
        </Select>

      </FormControl>
    </div>

    <div className="app__stats">
        <InfoBox 
        isRed
        active={casesType==='cases'}
        onClick={e=>setCasesType('cases')}
        title="Coronavirus Cases" 
        total={prettyPrintStat(countryInfo.cases)} 
        cases={(countryInfo.todayCases)}
        />
        
        <InfoBox 
        active={casesType==='recovered'}
        onClick={e=>setCasesType('recovered')}
        title="Recovered" 
        total={prettyPrintStat(countryInfo.recovered)} 
        cases={(countryInfo.todayRecovered)}
        />
        <InfoBox 
        isRed
        active={casesType==='deaths'}
        onClick={e=>setCasesType('deaths')}
        title="Deaths" 
        total={prettyPrintStat( countryInfo.deaths)} 
        cases={( countryInfo.todayDeaths)} 
        />
    </div>          
          <Map
            casesType={casesType}
            countries={mapCountries}
            center={mapCenter}
            zoom={mapZoom}
          />
    </div>
         <Card className="app__right">
            <CardContent>
              <h3>Live Cases by country</h3>
              <Table countries={tableData}/>
              <h3>Worldwide new {casesType}</h3>
              <LineGraph className="app__graph" casesType={casesType}/>
            </CardContent>

          


         </Card>
      
    </div>
      
  );
}

export default App;
