/* 
    https://material-ui.com/components/pickers/
    https://material-ui.com/components/buttons/#contained-buttons

*/
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import NativeSelect from '@material-ui/core/NativeSelect';

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
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 120,
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
    <form className={classes.container} noValidate>
      <DateAndTimePicker
        key="from-dt"
        id="from-dt"
        label="From"
        defaultValue={props.fromDT.replace('Z', '')}
        onChange={props.handleSelectDateTimeChange}
      />
      <DateAndTimePicker
        key="to-dt"
        id="to-dt"
        label="To"
        defaultValue={props.toDT.replace('Z', '')}
        onChange={props.handleSelectDateTimeChange}
      />

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="origin-native-helper">Origin</InputLabel>
        <NativeSelect
          value={props.selectedOrigin}
          onChange={props.handleSelectOriginChange}
          inputProps={{
            name: 'origin',
            id: 'origin-native-helper',
          }}
        >
          <option aria-label="None" value="" />
          {props.origins.map((origin) => (
            <option key={origin} value={origin}>
              {origin}
            </option>
          ))}
        </NativeSelect>
        <FormHelperText>Select origin of launches</FormHelperText>
      </FormControl>

      <ContainedButtons
        text="Refresh"
        isLoaded={props.isLoaded}
        handleRefresh={props.handleRefresh}
      />
    </form>
  );
}
