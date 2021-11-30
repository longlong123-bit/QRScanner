const express = require("express")
const app = express()
const cors = require("cors")
const pool = require("./databasepg")
const hostname = "192.168.1.128"
const port = 5000

//middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
  }));

//get where
app.get("/employee/:id", async (req, res) => {
    try {
        const {id} = req.params
        const employee = await pool.query('SELECT * FROM employee WHERE id = $1', [id])
        res.json(employee.rows[0])
    } catch (error) { console.error(error.message) }
})
// ATTENDANCE
app.post("/attendance/check_in", async (req, res) => {
    try {
        const {check_in, check_out, worked_hours, employee_id} = req.body
        const checked_in = await pool.query(`INSERT INTO attendance(check_in, check_out, worked_hours, employee_id) VALUES ($1,$2,$3,$4) RETURNING *`, [check_in, check_out, worked_hours, employee_id])
        const infoEmployee = await pool.query(`SELECT employee_id, employee_name, employee_company FROM attendance a FULL OUTER JOIN employee e ON a.employee_id = e.id WHERE employee_id = $1 LIMIT 1`, [employee_id])
        res.json(infoEmployee)
        console.log(`${employee_id} checked in successfully at ${check_in}`)
    } catch (error) { console.error(error.message) }
})
app.put("/attendance/check_out/:employee_id", async (req, res) => {
    try {
        const {employee_id} = req.params
        const {check_out, worked_hours} = req.body
        const checked_out = await pool.query("UPDATE attendance SET (check_out, worked_hours) = ($1,$2) WHERE employee_id = $3 AND check_out IS NULL RETURNING *", [check_out, worked_hours, employee_id])
        const infoEmployee = await pool.query(`SELECT employee_id, employee_name, employee_company FROM attendance a FULL OUTER JOIN employee e ON a.employee_id = e.id WHERE employee_id = $1 LIMIT 1`, [employee_id])
        res.json(infoEmployee)
        console.log(`${employee_id} checked out successfully at ${check_out}. Today worked hours ${worked_hours}`);
    } catch (error) { console.error(error.message) }
})
//get where
app.get("/attendance/:employee_id", async (req, res) => {
    try {
        const {employee_id} = req.params
        const attendance = await pool.query('SELECT * FROM attendance WHERE employee_id = $1 AND check_out IS NULL', [employee_id])
        res.json(attendance.rows)
    } catch (error) { console.error(error.message) }
})
app.listen(port, hostname, () => {
    console.log(`Server has started on http://${hostname}:${port}`)
})
