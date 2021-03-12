/*
    https://material-ui.com/components/data-grid/
*/
import * as React from 'react';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';

const columns = [
  { field: 'spec', headerName: 'Spec', flex: 1, type: 'string' },
  { field: 'provider', headerName: 'Provider', width: 110 },
  { field: 'timestamp', headerName: 'Date-Time [UTC]', flex: 0.25, type: 'dateTime' },
  { field: 'origin', headerName: 'Origin', width: 170, description: 'On which binder this launch happened.' },
];

export default function LaunchesDataTable(props) {
  return (
    <div style={{ height: 800, width: '100%' }}>
      <DataGrid
        rows={props.rows}
        columns={columns}
        pagination
        pageSize={100}
        rowsPerPageOptions={[100]}
        rowCount={props.rowCount}
        paginationMode="server"
        onPageChange={props.handlePageChange}
        components={{
            Toolbar: GridToolbar,
          }}
    />
    </div>
  );
}
