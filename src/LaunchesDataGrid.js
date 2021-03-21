/*
    https://material-ui.com/components/data-grid/
*/
import * as React from 'react';
// import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { DataGrid } from '@material-ui/data-grid';

export default function LaunchesDataTable(props) {
  return (
    <div style={{ height: 800, width: '100%' }}>
      <DataGrid
        rows={props.rows}
        columns={props.columns}
        pagination
        pageSize={100}
        rowsPerPageOptions={[100]}
        rowCount={props.rowCount}
        paginationMode="server"
        onPageChange={props.handlePageChange}
        // components={{Toolbar: GridToolbar,}}
    />
    </div>
  );
}
