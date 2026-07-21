using System;
using System.Data;
using System.Data.SqlClient;
using NtbSoft.ERP.Libs;

namespace NtbSoft.ERP.Model.Common
{
    public class CommonWebModel
    {
        public DataTable Get(RequestGet req)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();
                SqlCommand cmd = new SqlCommand(req.ProcedureName, conn);
                SqlParameter messageParam = new SqlParameter("@message", SqlDbType.NVarChar, -1);
                messageParam.Direction = ParameterDirection.Output;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("Action", req?.Action ?? "");
                cmd.Parameters.AddWithValue("@parameter", req?.Parameter ?? "");
                cmd.Parameters.AddWithValue("@parameter1", req?.Parameter1 ?? "");
                cmd.Parameters.AddWithValue("@parameter2", req?.Parameter2 ?? "");
                cmd.Parameters.AddWithValue("@parameter3", req?.Parameter3 ?? 0);
                cmd.Parameters.AddWithValue("@parameter4", req?.Parameter4 ?? 0);
                cmd.Parameters.AddWithValue("@parameter5", req?.Parameter5 ?? 0);
                cmd.Parameters.AddWithValue("@parameter6", req.Parameter6.HasValue ? (object)req.Parameter6.Value : DBNull.Value);
                cmd.Parameters.AddWithValue("@parameter7", req.Parameter7.HasValue ? (object)req.Parameter7.Value : DBNull.Value);
                cmd.Parameters.AddWithValue("@TypeTable", new CreateNewDataTable()._default(req.TableName).TypeTable);
                cmd.Parameters.Add(messageParam);
                using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                {
                    DataTable ds = new DataTable();
                    adt.Fill(ds);
                    return ds;
                }
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        public DataTable GetByTypeTable(RequestPost req)
        {
            SqlConnection conn = null;
            try
            {
                DataTable dtSchema =
                    new CreateNewDataTable()._default(req.TableName).TypeTable;

                if (req.TypeTable != null)
                {
                    foreach (DataRow row in req.TypeTable.Rows)
                    {
                        DataRow dr = dtSchema.NewRow();
                        foreach (DataColumn col in dtSchema.Columns)
                        {
                            if (req.TypeTable.Columns.Contains(col.ColumnName))
                                dr[col.ColumnName] = row[col.ColumnName] ?? DBNull.Value;
                            else
                                dr[col.ColumnName] = DBNull.Value;
                        }
                        dtSchema.Rows.Add(dr);
                    }
                }

                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();
                SqlCommand cmd = new SqlCommand(req.ProcedureName, conn);
                SqlParameter messageParam = new SqlParameter("@message", SqlDbType.NVarChar, -1);
                messageParam.Direction = ParameterDirection.Output;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("Action", req?.Action ?? "");
                cmd.Parameters.AddWithValue("@parameter", req?.Parameter ?? "");
                cmd.Parameters.AddWithValue("@parameter1", req?.Parameter1 ?? "");
                cmd.Parameters.AddWithValue("@parameter2", req?.Parameter2 ?? "");
                cmd.Parameters.AddWithValue("@parameter3", req?.Parameter3 ?? 0);
                cmd.Parameters.AddWithValue("@parameter4", req?.Parameter4 ?? 0.0);
                cmd.Parameters.AddWithValue("@parameter5", req?.Parameter5 ?? 0.0);
                cmd.Parameters.AddWithValue("@parameter6", req.Parameter6.HasValue ? (object)req.Parameter6.Value : DBNull.Value);
                cmd.Parameters.AddWithValue("@parameter7", req.Parameter7.HasValue ? (object)req.Parameter7.Value : DBNull.Value);
                cmd.Parameters.AddWithValue("@TypeTable", dtSchema);
                cmd.Parameters.Add(messageParam);
                using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                {
                    DataTable ds = new DataTable();
                    adt.Fill(ds);
                    return ds;
                }
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        public string Post(RequestPost req)
        {
            SqlConnection conn = null;
            try
            {
                DataTable dtSchema =
                    new CreateNewDataTable()._default(req.TableName).TypeTable;

                if (req.TypeTable != null)
                {
                    foreach (DataRow row in req.TypeTable.Rows)
                    {
                        DataRow dr = dtSchema.NewRow();
                        foreach (DataColumn col in dtSchema.Columns)
                        {
                            if (req.TypeTable.Columns.Contains(col.ColumnName))
                                dr[col.ColumnName] = row[col.ColumnName] ?? DBNull.Value;
                            else
                                dr[col.ColumnName] = DBNull.Value;
                        }
                        dtSchema.Rows.Add(dr);
                    }
                }

                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();
                SqlCommand cmd = new SqlCommand(req.ProcedureName, conn);
                SqlParameter messageParam = new SqlParameter("@message", SqlDbType.NVarChar, 500);
                messageParam.Direction = ParameterDirection.Output;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("Action", req.Action ?? "");
                cmd.Parameters.AddWithValue("@parameter", req.Parameter ?? "");
                cmd.Parameters.AddWithValue("@parameter1", req.Parameter1 ?? "");
                cmd.Parameters.AddWithValue("@parameter2", req.Parameter2 ?? "");
                cmd.Parameters.AddWithValue("@parameter3", req.Parameter3);
                cmd.Parameters.AddWithValue("@parameter4", req.Parameter4);
                cmd.Parameters.AddWithValue("@parameter5", req.Parameter5);
                cmd.Parameters.AddWithValue("@parameter6", req.Parameter6.HasValue ? (object)req.Parameter6.Value : DBNull.Value);
                cmd.Parameters.AddWithValue("@parameter7", req.Parameter7.HasValue ? (object)req.Parameter7.Value : DBNull.Value);
                cmd.Parameters.AddWithValue("@TypeTable", dtSchema);
                cmd.Parameters.Add(messageParam);
                cmd.ExecuteNonQuery();

                string message = messageParam.Value != DBNull.Value ? (string)messageParam.Value : "True";

                return message;
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
    }
}