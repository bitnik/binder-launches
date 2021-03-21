/*
    Here is the form with all filters is defined.
    https://material-ui.com/components/pickers/
    https://material-ui.com/components/selects/#multiple-select
    https://material-ui.com/components/buttons/#contained-buttons
*/
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import FormHelperText from '@material-ui/core/FormHelperText';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  textFieldSmall: {
    width: 120,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300
  },
  refreshButton: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

function DateAndTimePicker(props) {
  const classes = useStyles();

  return (
    <TextField
      id={props.id}
      label={props.label}
      type="datetime-local"
      defaultValue={props.defaultValue}
      className={classes.textField}
      InputLabelProps={{
        shrink: true,
      }}
      onChange={props.onChange}
  />
  );
}

function MultipleSelect(props) {
  const classes = useStyles();
  // const [selecteds, setSelecteds] = React.useState([]);
  const [selecteds, setSelecteds] = React.useState(props.defaultValue);

  const handleChangeMultiple = (event) => {
    const { options } = event.target;
    const value = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setSelecteds(value);
    props.handleSelecteds(props.id, value);
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel shrink htmlFor={props.id}>
          {props.title}
        </InputLabel>
        <Select
          multiple
          native
          value={selecteds}
          onChange={handleChangeMultiple}
          inputProps={{
            id: props.id
          }}
        >
          {props.items.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

function SingleSelect(props) {
  let options = [];
  if (props.defaultNone) {
    options.push(<option key="none" aria-label="None" value="" />);
  }
  Object.entries(props.items).forEach(([k, v]) => {
    options.push(<option key={k} value={k}>{v}</option>);
  })
  return (
    <Select
      native
      value={props.value}
      onChange={props.handleChange}
      inputProps={{
        id: props.id,
      }}
    >
      {options}
    </Select>
  );
}

function RepoSelect(props) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    op: props.defaultOperation,
    val: props.defaultValue,
  });

  const handleChange = (event) => {
    setState({op: event.target.value});
  };
  const handleChangeText = (event) => {
    setState({val: event.target.value});
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel shrink htmlFor={props.id}>
        {props.title}
      </InputLabel>
      <SingleSelect
        key={props.id}
        id={props.id}
        value={state.op}
        handleChange={handleChange}
        defaultNone={true}
        items={props.items}
      />
      <TextField
        id={props.id+"-value"}
        className={classes.textFieldSmall}
        defaultValue={state.val}
        onChange={handleChangeText}
      />
    </FormControl>
  )
}

function GroupBySelect(props) {
  const classes = useStyles();
  const [val, setState] = React.useState(props.defaultValue);

  const handleChange = (event) => {
    setState(event.target.value);
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel shrink htmlFor={props.id}>
        {props.title}
      </InputLabel>
      <SingleSelect
        key={props.id}
        id={props.id}
        value={val}
        handleChange={handleChange}
        defaultNone={true}
        items={props.items}
      />
      <FormHelperText>
        {props.helpText}
      </FormHelperText>
    </FormControl>
  )
}

function ContainedButtons(props) {
  const classes = useStyles();

  return (
    <div className={classes.refreshButton}>
      <Button id="refresh-button" variant="contained" color="primary" onClick={props.handleRefresh} disabled={!props.isLoaded}>
        {props.text}
      </Button>
    </div>
  );
}

export default function FilterForm(props) {
  const classes = useStyles();

  return (
    <form className={classes.container} onSubmit={e => {e.preventDefault();}} noValidate>

      <FormControl className={classes.formControl}>
        <DateAndTimePicker
          key="from-dt"
          id="from-dt"
          label="From"
          defaultValue={props.fromDT}
          onChange={props.handleSelectDateTimeChange}
        />
        <DateAndTimePicker
          key="to-dt"
          id="to-dt"
          label="To"
          defaultValue={props.toDT}
          onChange={props.handleSelectDateTimeChange}
        />
      </FormControl>

      <MultipleSelect
        key="origins-select"
        id="origins-select"
        title="Origins"
        items={props.origins}
        defaultValue={props.selectedOrigins}
        handleSelecteds={props.handleMultiSelectChange}
      />

      <MultipleSelect
        key="providers-select"
        id="providers-select"
        title="Providers"
        items={props.providers}
        defaultValue={props.selectedProviders}
        handleSelecteds={props.handleMultiSelectChange}
      />

      <RepoSelect
        key="repo-select"
        id="repo-select"
        title="Repo"
        defaultOperation={props.selectedRepo.substring(0, props.selectedRepo.indexOf(':'))}
        defaultValue={props.selectedRepo.substring(props.selectedRepo.indexOf(':')+1)}
        items={{
          'eq': 'equals',
          'sw': 'starts with',
          'ew': 'ends with',
          'co': 'contains',
        }}
      />

      <GroupBySelect
        key="groupby-select"
        id="groupby-select"
        title="Group by"
        helpText="Computes count of groups"
        defaultValue={props.selectedGroupBy}
        items={{
          'provider-repo': 'provider, repo',
          'provider': 'provider',
          'origin': 'origin',
        }}
      />

      <ContainedButtons
        text="Refresh"
        isLoaded={props.isLoaded}
        handleRefresh={props.handleRefresh}
      />
    </form>
  );
}
