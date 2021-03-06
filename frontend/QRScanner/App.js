import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, Dimensions } from 'react-native'
import { Entypo } from '@expo/vector-icons'
import { BarCodeScanner } from 'expo-barcode-scanner'
import {revertSecondToHour} from './common/revertSecondsToHours.js'

export default function App() {
  var timeout
  const BASE_URL = "http://192.168.1.128:5000"
  const secondInHour = 3600000
  const [scanned, setScanned] = useState(false)
  const [employee, setEmployee] = useState([])
  const [isCheckIn, setIsCheckIn] = useState(false)
  const [isCheckOut, setIsCheckOut] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const [renderWorkedHours, setRenderWorkedHours] = useState()
  const [checkIn, setCheckIn] = useState()
  const [checkOut, setCheckOut] = useState()
  check_in = null, check_out = null, worked_hours = null

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }

  useEffect(() => {
    askForCameraPermission()
    }, [])

  const resetScanned = () => {
    timeout = setTimeout(() => {
      setScanned(false)
      setIsCheckIn(false)
      setIsCheckOut(false)
    },4000) 
  }

  const handleBarCodeScanned = async ({bounds, data}) => {
    if (bounds.size.height > 80 && bounds.size.width > 80){
    const employee_id = data
    setScanned(true)
      // Get employee and check (not checked in yet or not checked out yet)
      try {
        const response = await fetch(`${BASE_URL}/attendance/${employee_id}`)
        const result = await response.json()
        // If employee have not already check in 
        if (result.length === 0) {
          const check_in = new Date().toLocaleString("en-US", {timeZone: "asia/Ho_Chi_Minh", hour12:false})
          setCheckIn(check_in)
          try {
            const body = {check_in, check_out, worked_hours, employee_id}
            const response = await fetch(`${BASE_URL}/attendance/check_in`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)})
            const resultEmployee = await response.json()
            setEmployee(resultEmployee.rows)
            setIsCheckIn(true)
          } catch (error) { console.error(error.message) }
        // if employee checked in
        } else if (result[0].check_out === null) {
          const check_out = new Date().toLocaleString("en-US", {timeZone: "asia/Ho_Chi_Minh", hour12:false})
          setCheckOut(check_out)
          const worked_hours = ((new Date(check_out)) - (new Date(result[0].check_in)))/secondInHour
          setRenderWorkedHours(revertSecondToHour(worked_hours))
          try {
            const body = {check_out, worked_hours}
            const response = await fetch(`${BASE_URL}/attendance/check_out/${employee_id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
          })
          const resultEmployee = await response.json()
          setEmployee(resultEmployee.rows)
          setIsCheckOut(true)
          } catch (error) { console.error(error.message) }
        }
      } catch (error) { console.error(error.message) }
    resetScanned()
    }
  }
  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>
  }
  if (hasPermission === false) { 
    return <Text>No access to camera</Text>
  }
  const InfoEmployee = () => {
    return (
      <React.Fragment>
        {employee.map((e) => (
          <React.Fragment key={e.employee_id}>
            <Entypo style={styles.icon} name="check" size={150} color="#00ff08" />
            <Text style={styles.title}>Successfully</Text>
            <Text style={styles.textEmployee}>Welcome {e.employee_name}</Text>
            <Text style={styles.textEmployee}>Company: {e.employee_company}</Text>       
          </React.Fragment>
        ))}
      </React.Fragment>
    )
  }
  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.camera}
        type={'front'}>
      </BarCodeScanner>
      <View style={styles.view_employee}>
        <React.Fragment>
          {isCheckIn
          ? 
            <>
              <InfoEmployee/>
              <Text style={styles.textEmployee}>You checked in successfully at: {checkIn}</Text>
              <Text style={styles.end}>Have a good day</Text> 
            </>
          : 
            undefined 
          }
          {isCheckOut 
          ? 
            <>
              <InfoEmployee/>
              <Text style={styles.textEmployee}>You checked out successfully at: {checkOut}</Text>
              <Text style={styles.textEmployee}>Today worked hours: {renderWorkedHours}</Text>
              <Text style={styles.end}>Good Bye And See You Again!</Text> 
            </>
          : 
            undefined 
          }
        </React.Fragment>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position:'relative',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  camera: {
    flex: 1.5
  },
  view_employee: {
    flex: 2, 
    padding: 20,
  },
  textEmployee: {
    fontSize: 19,
    padding: 10,
    textAlign: "center"
  },
  icon: {
    textAlign: "center"
  },
  title: {
    fontSize: 37,
    color: "#00ff08",
    fontWeight: "600",
    textAlign: "center"
  },
  end: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "500"
  }
})