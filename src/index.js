import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import FilterForm from './FilterForm';
import { LinearIndeterminate } from './Loading';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
// import LaunchesTable from './LaunchesTable';
import LaunchesDataTable from './LaunchesDataGrid';
import ErrorSnackbar from './Snackbar';

const path = require('path');

function dateToYMD(date) {
  var d = date.getDate();
  var m = date.getMonth() + 1;
  var y = date.getFullYear();
  return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}


class BinderLaunches extends React.Component {
  constructor(props) {
    super(props);
    this.rows = [];
    // next page number from API
    this.nextPage = null;
    // this is used in the table to show total number of rows
    this.rowCount = null;
    // attributes to hold filter values
    // We dont want to hold every selected value in state, because we want to update the table only when Refresh button is clicked
    // by default show launches in last 24 hours
    // dont use toISOString because it converts the date to UTC
    // this.selectedFromDT = new Date(new Date(new Date().setDate(new Date().getDate()-1)).setSeconds(0,0)).toISOString();
    this.selectedFromDT = new Date(new Date(new Date().setDate(new Date().getDate()-1)).setSeconds(0,0));
    this.selectedFromDT = dateToYMD(this.selectedFromDT) + 'T' + this.selectedFromDT.toLocaleString('en-GB').split(', ')[1];
    this.selectedToDT = new Date(new Date().setSeconds(0,0));
    this.selectedToDT = dateToYMD(this.selectedToDT) + 'T' + this.selectedToDT.toLocaleString('en-GB').split(', ')[1];
    this.descOrder = true;
    this.selectedOrigins = [];
    this.selectedProviders = [];
    this.firstLaunchTS = null;
    this.lastLaunchTS = null;
    this.selectedRepo = '';
    this.selectedGroupBy = '';

    // if there are query params in hash, use them to set the default values
    this.urlHash = window.location.hash;
    console.log(this.urlHash);
    if (this.urlHash) {
      const url = new URL(window.location.origin + this.urlHash.substring(1));
      const fromParam = url.searchParams.get('from');
      if (fromParam !== null) {
        this.selectedFromDT = fromParam;
      }
      const toParam = url.searchParams.get('to');
      if (toParam !== null) {
        this.selectedToDT = toParam;
      }
      const descParam = url.searchParams.get('desc');
      if (descParam !== null) {
        this.descOrder = descParam.toLowerCase();
      }
      const originsParam = url.searchParams.get('origins');
      if (originsParam !== null) {
        this.selectedOrigins = originsParam.split(',');
      }
      const providersPparam = url.searchParams.get('providers');
      if (providersPparam !== null) {
        this.selectedProviders = providersPparam.split(',');
      }
      const repoParam = url.searchParams.get('repo');
      if (repoParam !== null) {
        this.selectedRepo = repoParam;
      }
      const groupByParam = url.searchParams.get('groupby');
      if (groupByParam !== null) {
        this.selectedGroupBy = groupByParam;
      }
      // page is not in the filter group, so dont update it
      // const page_param = url.searchParams.get('page');
      // if (page_param !== null) {
      //   this.nextPage = page_param;
      // }
    }
    // console.log(this.selectedFromDT, this.selectedToDT, this.selectedOrigins, this.selectedProviders, this.nextPage);

    this.state = {
      error: null,
      isLoaded: false,
      fromDT: this.selectedFromDT,
      toDT: this.selectedToDT,
      descOrder: this.descOrder,
      selectedOrigins: this.selectedOrigins,
      selectedProviders: this.selectedProviders,
      selectedRepo: this.selectedRepo,
      selectedGroupBy: this.selectedGroupBy,
      // config is fetched only once at the beginning, but add origins and providers into state
      // so we can load the table and filters asyncly at the beginning -> componentDidMount
      origins: [],
      providers: [],
    }
    // https://reactjs.org/docs/handling-events.html
    this.handleSelectDateTimeChange = this.handleSelectDateTimeChange.bind(this);
    this.handleMultiSelectChange = this.handleMultiSelectChange.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
  }

  componentDidMount() {
    // When the component is inserted in the DOM, React calls the componentDidMount() lifecycle method.
    this.fetchData(this.nextPage);
    // fetch config only one time when component is mounted
    this.fetchConfig();
  }

  fetchData(page=null) {
    // get selected values and construct the url
    let urlPart = '?from=' + encodeURIComponent(this.state.fromDT) + '&to=' + encodeURIComponent(this.state.toDT);
    urlPart = urlPart + '&desc=' + String(this.descOrder);
    if (this.selectedOrigins.length) {
      urlPart = urlPart + '&origins=' + this.selectedOrigins.join(',');
    }
    if (this.selectedProviders.length) {
      urlPart = urlPart + '&providers=' + this.selectedProviders.join(',');
    }
    if (this.selectedRepo) {
      urlPart = urlPart + '&repo=' + this.selectedRepo;
    }
    if (this.selectedGroupBy) {
      urlPart = urlPart + '&groupby=' + this.selectedGroupBy;
    }
    this.urlHash = urlPart;
    if (page) {
      urlPart = urlPart + '&page=' + page;
    }
    const url = path.join(window.location.pathname, '/launches' + urlPart)
    console.log(url);
    // fetch the launches
    fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          if ('error' in result) {
            this.setState({
              isLoaded: true,
              error: {'message': 'Error while fetching launches: ' + result.error}
            });
          } else {
            result.launches.forEach((d, i) => {
              // NOTE: this converts timestamp to local time as well
              d.timestamp = new Date(d.timestamp);
              delete d.schema;
              delete d.version;
              delete d.status;
              d['id'] = i.toString();
              // console.log(d);
            });
            this.rows = result.launches;
            this.nextPage = result.nextPage;
            if (this.nextPage) {
              this.rowCount = 100 * this.nextPage;
            }
            // console.log('nextPage:', this.nextPage, this.rowCount);
            this.setState({
              isLoaded: true,
              error: null
            });
          }
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

  fetchConfig() {
    const url = path.join(window.location.pathname, '/config')
    const origins = [];
    const providers = [];
    console.log(url);
    fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          if ('error' in result) {
            this.setState({
              error: {'message': 'Error while fetching config: ' + result.error}
            });
          } else {
            result.origins.forEach((e, i) => {
              origins.push(e.origin);
            });
            result.providers.forEach((e, i) => {
              providers.push(e.provider);
            });
            this.firstLaunchTS = result.first_launch_ts_in_db.timestamp;
            this.lastLaunchTS = result.last_launch_ts_in_db.timestamp;
            this.setState({origins: origins, providers: providers});
        }
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            error: {'message': 'Error while fetching config: ' + error}
          });
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

  handleMultiSelectChange(selectedId, selectedValues) {
    if (selectedId === 'origins-select') {
      this.selectedOrigins = selectedValues;
    } else if (selectedId === 'providers-select') {
      this.selectedProviders = selectedValues;
    }
    // console.log(this.selectedOrigins, this.selectedProviders);
  }

  setSelectedRepo() {
    const val = document.getElementById("repo-select-value").value;
    const op = document.getElementById("repo-select").value;
    this.selectedRepo = encodeURIComponent(op + ':' + val);
    // console.log(this.selectedRepo);
  }

  handleRefresh() {
    this.setSelectedRepo();
    this.descOrder = document.getElementById("order-switch").checked;
    this.selectedGroupBy = document.getElementById("groupby-select").value;
    this.setState({
      fromDT: this.selectedFromDT,
      toDT: this.selectedToDT,
      descOrder: this.descOrder,
      selectedOrigins: this.selectedOrigins,
      selectedProviders: this.selectedProviders,
      selectedRepo: this.selectedRepo,
      selectedGroupBy: this.selectedGroupBy,
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
    this.fetchData(event.page+1);
    // window.location.hash = this.urlHash;
  }

  render() {
    // console.log("render...")
    let errorBar;
    if (this.state.error) {
      errorBar = (<ErrorSnackbar msg={this.state.error.message} />);
    }
    let table;
    if (!this.state.isLoaded) {
      table = (<LinearIndeterminate />);
    } else {
      let columns;
      if (this.selectedGroupBy === 'provider-repo') {
        columns = [
          { field: 'provider', headerName: 'Provider', flex: 0.25 },
          { field: 'repo', headerName: 'Repo', flex: 0.5 },
          { field: 'count', headerName: 'Count', flex: 0.25 },
        ];
      } else if (this.selectedGroupBy === 'provider') {
        columns = [
          { field: 'provider', headerName: 'Provider', flex: 0.25 },
          { field: 'count', headerName: 'Count', flex: 0.25 },
        ];
      } else if (this.selectedGroupBy === 'origin') {
        columns = [
          { field: 'origin', headerName: 'Origin', flex: 0.25 },
          { field: 'count', headerName: 'Count', flex: 0.25 },
        ];
      } else {
        columns = [
          // { field: 'spec', headerName: 'Spec', flex: 1, type: 'string' },
          { field: 'timestamp', headerName: 'Date-Time', flex: 0.25, type: 'dateTime' },
          { field: 'provider', headerName: 'Provider', width: 110 },
          { field: 'repo', headerName: 'Repo', flex: 0.25 },
          { field: 'ref', headerName: 'Ref', width: 110 },
          { field: 'resolved_ref', headerName: 'Resolved ref', flex: 0.25 },
          { field: 'origin', headerName: 'Origin', width: 150, description: 'On which binder it happened.' },
        ];
      }
      // console.log(columns);
      table = (<LaunchesDataTable rows={this.rows} columns={columns} rowCount={this.rowCount} handlePageChange={this.handlePageChange} />);
    }
    // let info;
    // if (this.firstLaunchTS && this.lastLaunchTS) {
    //   info =(<div>In database there are launches from {this.firstLaunchTS} until {this.lastLaunchTS} saved.</div>);
    // }
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
              descOrder={this.state.descOrder}
              origins={this.state.origins}
              providers={this.state.providers}
              selectedOrigins={this.state.selectedOrigins}
              selectedProviders={this.state.selectedProviders}
              selectedRepo={this.state.selectedRepo}
              selectedGroupBy={this.state.selectedGroupBy}
              isLoaded={this.state.isLoaded}
              handleSelectDateTimeChange={this.handleSelectDateTimeChange}
              handleMultiSelectChange={this.handleMultiSelectChange}
              handleRefresh={this.handleRefresh}
            />
          </Grid>
        </Grid>
        {/* <Grid item xs={12}>
          {info}
        </Grid> */}
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
        {errorBar}
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
