import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { supabase } from './supabase'
import { fetchClasses, fetchClassStudents } from './classesManagement'

// Month names list
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/**
 * Fetch attendance for a specific class and month/year
 */
async function fetchClassAttendanceForMonth(classId, month, year) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('attendance')
    .select('student_id, attendance_date, status')
    .eq('class_id', classId)
    .gte('attendance_date', startDate)
    .lte('attendance_date', endDate)

  if (error) {
    throw new Error(error.message || 'Error fetching attendance records.')
  }

  return data || []
}

/**
 * Generate and download professional Excel attendance sheet
 */
export async function exportAttendanceToExcel(classId, month, year, onProgress) {
  try {
    if (onProgress) onProgress('Fetching classes...')
    
    // 1. Fetch all classes for the teacher
    let classes = await fetchClasses()
    if (!classes || classes.length === 0) {
      throw new Error('No classes found.')
    }

    // Filter by classId if a specific one is selected
    if (classId && classId !== 'all') {
      classes = classes.filter((item) => item.id === classId)
      if (classes.length === 0) {
        throw new Error('Selected class not found.')
      }
    }

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Raj Tuition Classes'
    workbook.lastModifiedBy = 'Raj Tuition Classes'
    workbook.created = new Date()
    workbook.modified = new Date()

    let totalAttendanceCount = 0

    // Process each class
    for (const classItem of classes) {
      if (onProgress) onProgress(`Fetching data for ${classItem.className}...`)

      // Fetch students in this class
      const students = await fetchClassStudents(classItem.id)
      
      // Fetch attendance for selected month/year
      const attendanceRecords = await fetchClassAttendanceForMonth(classItem.id, month, year)
      totalAttendanceCount += attendanceRecords.length

      // Setup sheet name (limit to 31 chars as required by Excel, remove invalid chars)
      const rawSheetName = `${classItem.className} (${classItem.classLevel || 'N/A'})`
      const cleanName = rawSheetName.replace(/[\\\/\?\*\[\]]/g, '').slice(0, 31)
      const sheet = workbook.addWorksheet(cleanName || `Class_${classItem.id.slice(0, 5)}`, {
        views: [{ state: 'frozen', ySplit: 5 }]
      })

      // Show gridlines
      sheet.views[0].showGridLines = true

      const monthName = MONTHS[month - 1]
      const totalDays = new Date(year, month, 0).getDate()

      // Define styling tokens
      const primaryBlue = '1E3A8A' // Navy Blue
      const lightBlue = 'EFF6FF'
      const whiteText = 'FFFFFF'
      const darkText = '1E293B'
      const borderStyle = { style: 'thin', color: { argb: 'CBD5E1' } }
      const headerBorder = { style: 'medium', color: { argb: '1E3A8A' } }

      // --- 1. Top Header Section ---
      // A1: RAJ TUITION CLASSES
      sheet.mergeCells(1, 1, 1, totalDays + 1)
      const r1 = sheet.getCell(1, 1)
      r1.value = 'RAJ TUITION CLASSES'
      r1.font = { name: 'Arial', size: 16, bold: true, color: { argb: whiteText } }
      r1.alignment = { horizontal: 'center', vertical: 'middle' }
      r1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryBlue } }

      // A2: ATTENDANCE REPORT
      sheet.mergeCells(2, 1, 2, totalDays + 1)
      const r2 = sheet.getCell(2, 1)
      r2.value = 'ATTENDANCE REPORT'
      r2.font = { name: 'Arial', size: 12, bold: true, color: { argb: whiteText } }
      r2.alignment = { horizontal: 'center', vertical: 'middle' }
      r2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } }

      // Row height adjustment for header
      sheet.getRow(1).height = 30
      sheet.getRow(2).height = 20

      // Row 3: Meta Info (Month, Class, Batch)
      sheet.getRow(3).height = 25
      const metaValues = [
        { label: 'Month:', val: `${monthName} ${year}`, colLabel: 1, colVal: 2 },
        { label: 'Class:', val: classItem.classLevel || 'N/A', colLabel: 4, colVal: 5 },
        { label: 'Batch:', val: classItem.className || 'N/A', colLabel: 7, colVal: 8 }
      ]

      metaValues.forEach(({ label, val, colLabel, colVal }) => {
        const cLabel = sheet.getCell(3, colLabel)
        cLabel.value = label
        cLabel.font = { name: 'Arial', size: 10, bold: true, color: { argb: '475569' } }
        cLabel.alignment = { horizontal: 'left', vertical: 'middle' }

        const cVal = sheet.getCell(3, colVal)
        cVal.value = val
        cVal.font = { name: 'Arial', size: 10, bold: true, color: { argb: darkText } }
        cVal.alignment = { horizontal: 'left', vertical: 'middle' }
      })

      // Row 4: Spacer Row
      sheet.getRow(4).height = 15

      // --- 2. Attendance Table Headers ---
      sheet.getRow(5).height = 25
      const headerRow = sheet.getRow(5)
      
      // Col 1: Student Name
      const cellName = headerRow.getCell(1)
      cellName.value = 'Student Name'
      cellName.font = { name: 'Arial', size: 10, bold: true, color: { argb: whiteText } }
      cellName.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryBlue } }
      cellName.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
      cellName.border = { top: headerBorder, bottom: headerBorder, left: borderStyle, right: borderStyle }

      // Cols 2 to totalDays + 1: Days 1 to 31
      for (let day = 1; day <= totalDays; day++) {
        const colIdx = day + 1
        const cellDay = headerRow.getCell(colIdx)
        cellDay.value = day
        cellDay.font = { name: 'Arial', size: 10, bold: true, color: { argb: whiteText } }
        cellDay.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryBlue } }
        cellDay.alignment = { horizontal: 'center', vertical: 'middle' }
        cellDay.border = { top: headerBorder, bottom: headerBorder, left: borderStyle, right: borderStyle }
      }

      // Map student attendance for quick lookups
      // Map: studentId -> dateString -> status
      const attMap = {}
      attendanceRecords.forEach(rec => {
        if (!attMap[rec.student_id]) {
          attMap[rec.student_id] = {}
        }
        if (rec.attendance_date) {
          const dayNum = parseInt(rec.attendance_date.slice(8, 10), 10)
          attMap[rec.student_id][dayNum] = rec.status
        }
      })

      // --- 3. Fill Attendance Records ---
      let startRow = 6
      students.forEach((student, sIdx) => {
        const currentRow = startRow + sIdx
        const row = sheet.getRow(currentRow)
        row.height = 22

        const admissionDateStr = student.createdAt ? (typeof student.createdAt === 'string' ? student.createdAt.slice(0, 10) : new Date(student.createdAt).toISOString().slice(0, 10)) : ''

        const nameCell = row.getCell(1)
        nameCell.value = student.name || 'N/A'
        nameCell.font = { name: 'Arial', size: 10, color: { argb: darkText } }
        nameCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
        nameCell.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle }
        
        // Striping for readability
        if (currentRow % 2 === 1) {
          nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } }
        }

        // Fill status for each day
        for (let day = 1; day <= totalDays; day++) {
          const colIdx = day + 1
          const statusCell = row.getCell(colIdx)
          
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isBeforeAdmission = admissionDateStr && dateStr < admissionDateStr

          let displayVal = '*'
          let valColor = '94A3B8'
          let isBold = false

          if (isBeforeAdmission) {
            displayVal = 'N/A'
            valColor = '94A3B8' // light gray for N/A
          } else {
            const status = attMap[student.id]?.[day]
            if (status === 'present') {
              displayVal = 'P'
              valColor = '16A34A'
              isBold = true
            } else if (status === 'absent') {
              displayVal = 'A'
              valColor = 'DC2626'
              isBold = true
            }
          }

          statusCell.value = displayVal
          statusCell.font = { 
            name: 'Arial', 
            size: 9, 
            bold: isBold, 
            color: { argb: valColor } 
          }
          statusCell.alignment = { horizontal: 'center', vertical: 'middle' }
          statusCell.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle }

          // Striping
          if (currentRow % 2 === 1) {
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } }
          }
        }
      })

      // --- 4. Bottom Summary Section ---
      const summaryStartRow = startRow + students.length + 2
      
      // Header for summary table
      sheet.getRow(summaryStartRow).height = 25
      const sumHeaderRow = sheet.getRow(summaryStartRow)
      const sumCols = ['Student Name', 'Present Count', 'Absent Count', 'Attendance %']
      
      sumCols.forEach((colName, cIdx) => {
        const cell = sumHeaderRow.getCell(cIdx + 1)
        cell.value = colName
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: whiteText } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } }
        cell.alignment = { horizontal: cIdx === 0 ? 'left' : 'center', vertical: 'middle', indent: cIdx === 0 ? 1 : 0 }
        cell.border = { top: headerBorder, bottom: headerBorder, left: borderStyle, right: borderStyle }
      })

      // Fill values for summary
      students.forEach((student, sIdx) => {
        const currentSumRow = summaryStartRow + 1 + sIdx
        const row = sheet.getRow(currentSumRow)
        row.height = 22

        const admissionDateStr = student.createdAt ? (typeof student.createdAt === 'string' ? student.createdAt.slice(0, 10) : new Date(student.createdAt).toISOString().slice(0, 10)) : ''

        let pCount = 0
        let aCount = 0
        for (let day = 1; day <= totalDays; day++) {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isBeforeAdmission = admissionDateStr && dateStr < admissionDateStr

          if (!isBeforeAdmission) {
            const status = attMap[student.id]?.[day]
            if (status === 'present') pCount++
            if (status === 'absent') aCount++
          }
        }

        const totalRecorded = pCount + aCount
        const percentage = totalRecorded > 0 ? ((pCount / totalRecorded) * 100).toFixed(2) + '%' : 'N/A'

        const valName = row.getCell(1)
        valName.value = student.name || 'N/A'
        valName.font = { name: 'Arial', size: 10, color: { argb: darkText } }
        valName.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
        valName.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle }

        const valPresent = row.getCell(2)
        valPresent.value = totalRecorded > 0 ? pCount : '-'
        valPresent.font = { name: 'Arial', size: 10, color: { argb: totalRecorded > 0 ? '16A34A' : '94A3B8' }, bold: totalRecorded > 0 }
        valPresent.alignment = { horizontal: 'center', vertical: 'middle' }
        valPresent.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle }

        const valAbsent = row.getCell(3)
        valAbsent.value = totalRecorded > 0 ? aCount : '-'
        valAbsent.font = { name: 'Arial', size: 10, color: { argb: totalRecorded > 0 ? 'DC2626' : '94A3B8' }, bold: totalRecorded > 0 }
        valAbsent.alignment = { horizontal: 'center', vertical: 'middle' }
        valAbsent.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle }

        const valPercent = row.getCell(4)
        valPercent.value = percentage
        valPercent.font = { name: 'Arial', size: 10, bold: true, color: { argb: totalRecorded > 0 ? '1E3A8A' : '94A3B8' } }
        valPercent.alignment = { horizontal: 'center', vertical: 'middle' }
        valPercent.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle }

        // Striping
        if (currentSumRow % 2 === 1) {
          [valName, valPresent, valAbsent, valPercent].forEach(c => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } }
          })
        }
      })

      // --- 5. Column Width Adjustments ---
      // Auto column width logic
      sheet.columns.forEach((column, index) => {
        if (index === 0) {
          // Student Name column width
          column.width = 24
        } else if (index < totalDays + 1) {
          // Day columns width
          column.width = 4.5
        } else {
          column.width = 15
        }
      })
    }

    if (totalAttendanceCount === 0) {
      return { success: false, reason: 'NO_ATTENDANCE' }
    }

    if (onProgress) onProgress('Downloading Excel file...')
    
    // Write out workbook
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const monthName = MONTHS[month - 1]

    let fileName = `RTC_Attendance_All_Classes_${monthName}_${year}.xlsx`
    if (classId && classId !== 'all') {
      const selectedClass = classes[0]
      const cleanClassName = (selectedClass.className || 'Class').replace(/[^a-zA-Z0-9]/g, '_')
      const cleanClassLevel = (selectedClass.classLevel || 'N_A').replace(/[^a-zA-Z0-9]/g, '_')
      fileName = `RTC_Attendance_${cleanClassName}_${cleanClassLevel}_${monthName}_${year}.xlsx`
      fileName = fileName.replace(/_+/g, '_')
    }

    saveAs(blob, fileName)

    return { success: true }
  } catch (error) {
    console.error('Export error:', error)
    return { success: false, reason: 'ERROR', message: error.message }
  }
}
