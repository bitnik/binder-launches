import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles((theme) => ({
  circular: {
    display: 'flex',
    '& > * + *': {
      marginLeft: theme.spacing(4),
    },
  },
  linear: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

export function CircularIndeterminate() {
  const classes = useStyles();

  return (
    <div className={classes.circular}>
      <CircularProgress />
      {/* <CircularProgress color="secondary" /> */}
    </div>
  );
}

export function LinearIndeterminate() {
  const classes = useStyles();

  return (
    <div className={classes.linear}>
      <LinearProgress />
      {/* <LinearProgress color="secondary" /> */}
    </div>
  );
}
