import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import FilterForm from './FilterForm';
import { LinearIndeterminate } from './Loading';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
// import LaunchesTable from './LaunchesTable';
import LaunchesDataTable from './LaunchesDataGrid';

class BinderLaunches extends React.Component {
  constructor(props) {
    super(props);
    this.rows = [];
    // next page number from API
    this.nextPage = null;
    // this is used in the table to show total number of rows
    this.rowCount = null;
    // attributes to hold filter values - I dont want to hold every selected value in state, because I want to update the table only when Refresh button is clicked
    // by default show launches in last 24 hours
    // now - 1 day [UTC]
    this.selectedFromDT = new Date(new Date(new Date().setDate(new Date().getDate()-1)).setSeconds(0,0)).toISOString();
    // now [UTC]
    this.selectedToDT = new Date(new Date().setSeconds(0,0)).toISOString();
    this.selectedOrigin = '';
    
    this.urlHash = window.location.hash;
    console.log(this.urlHash);
    if (this.urlHash) {
      // TODO validate values!
      this.urlHash = this.urlHash.substring(1);
      const urlHashParts = this.urlHash.split('?');
      [this.selectedFromDT, this.selectedToDT] = decodeURIComponent(urlHashParts[0]).split('/')
      if (urlHashParts.length === 2) {
        for (let p of decodeURIComponent(urlHashParts[1]).split('&')) {
          if (p.startsWith('origin=')) {
            this.selectedOrigin = p.replace('origin=', '');
          } 
          // changing page didnt work and actually page is not in the filter group, so dont update it
          // else if (p.startsWith('page=')) {
          //   this.nextPage = parseInt(p.replace('page=', ''));
          // }
        }
      }
    }
    console.log(this.selectedFromDT, this.selectedToDT, this.selectedOrigin, this.nextPage);

    this.state = {
      error: null,
      isLoaded: false,
      fromDT: this.selectedFromDT,
      toDT: this.selectedToDT,
      origins: [],
      origin: this.selectedOrigin
    }
    // https://reactjs.org/docs/handling-events.html
    this.handleSelectDateTimeChange = this.handleSelectDateTimeChange.bind(this);
    this.handleSelectOriginChange = this.handleSelectOriginChange.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
  }

  componentDidMount() {
    // When the component is inserted in the DOM, React calls the componentDidMount() lifecycle method.
    this.fetchData(this.nextPage);
    // fetch origins only one time when component is mounted
    this.fetchOrigins();
  }

  fetchData(page=null) {
    let urlPart = encodeURIComponent(this.state.fromDT) + '/' + encodeURIComponent(this.state.toDT);
    if (this.selectedOrigin) {
      urlPart = urlPart + '?origin=' + this.selectedOrigin;
    }
    this.urlHash = urlPart;
    if (page) {
      urlPart = urlPart + (this.selectedOrigin ? '&' : '?') + 'page=' + page;
    }
    const url = 'http://127.0.0.1:5000/gallery/api/v1.0/launches/' + urlPart;
    console.log(url);
    fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          result.launches.forEach((d, i) => {
            // delete d.timestamp;
            d.timestamp = new Date(d.timestamp);
            delete d.schema;
            delete d.version;
            // delete d.origin;
            delete d.status;
            d['id'] = i.toString();
            // console.log(d);
          });
          this.rows = result.launches;
          this.nextPage = result.next_page;
          if (this.nextPage) {
            this.rowCount = 100 * this.nextPage;
          }
          console.log('nextPage:', this.nextPage, this.rowCount);
          this.setState({
            isLoaded: true,
            error: null
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );
  }

  fetchOrigins() {
    const url = 'http://127.0.0.1:5000/gallery/api/v1.0/launches/origins/';
    const origins = [];
    console.log(url);
    fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          result.origins.forEach((o, i) => {
            origins.push(o.origin);
          });
          this.setState({origins: origins});
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log("error while fetching origins", error);
        }
      );
  }

  handleSelectDateTimeChange(event) {
    if (event.target.id === 'from-dt') {
      this.selectedFromDT = event.target.value;
    } else {
      this.selectedToDT = event.target.value;
    }
    // console.log(this.selectedFromDT, this.selectedToDT);
  }

  handleSelectOriginChange(event) {
    this.selectedOrigin = event.target.value;
    // we have to do this to be able to show selected value in Select component
    this.setState({origin: this.selectedOrigin});
  }

  handleRefresh() {
    // const fromDT = document.getElementById("from-dt").value;
    // const toDT = document.getElementById("to-dt").value;
    this.setState({
      fromDT: this.selectedFromDT,
      toDT: this.selectedToDT,
      isLoaded: false
    }, () => {
      // because setState is async, use callback to fetch data after state update is done
      // reset table properties before fetching data
      this.nextPage = null;
      this.rowCount = null;
      this.fetchData();
      window.location.hash = this.urlHash;
    });
  }

  handlePageChange(event) {
    console.log(event);
    this.fetchData(event.page+1);
    window.location.hash = this.urlHash;
  }

  render() {
    console.log("re-render...")
    let table;
    if (this.state.error) {
      table = (<div>Error: {this.state.error.message}</div>);
    } else if (!this.state.isLoaded) {
      table = (<LinearIndeterminate />);
    } else {
      // table = (<LaunchesTable rows={this.rows} />);
      table = (<LaunchesDataTable rows={this.rows} rowCount={this.rowCount} handlePageChange={this.handlePageChange} />);
    }
    // table = (<LinearIndeterminate />);
    return (
      <Container maxWidth="lg">
        <Grid 
          container 
          spacing={6} 
          direction="column"
          justify="center"
          alignItems="center"
          >
          <Grid item xs={12}>
            <FilterForm 
              fromDT={this.state.fromDT} 
              toDT={this.state.toDT} 
              origins={this.state.origins}
              isLoaded={this.state.isLoaded}
              handleSelectDateTimeChange={this.handleSelectDateTimeChange}
              selectedOrigin={this.state.origin}
              handleSelectOriginChange={this.handleSelectOriginChange}
              handleRefresh={this.handleRefresh}
            />
          </Grid>
        </Grid>
        <Grid 
          container 
          spacing={6} 
          direction="row"
          justify="center"
          alignItems="center"
          >
          <Grid item xs={12}>
            {table}
          </Grid>
        </Grid>
      </Container>
    )
  }
}

ReactDOM.render(
  <React.StrictMode>
    <BinderLaunches />
  </React.StrictMode>,
  document.getElementById('root')
);
