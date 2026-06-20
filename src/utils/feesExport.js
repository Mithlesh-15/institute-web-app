import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { supabase } from './supabase'
import { fetchStudentFees, fetchStudentProfile } from './studentPortal'
import { fetchStudents } from './studentManagement'

// Month list matching standard format
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/**
 * Generate and download Excel sheet for individual student fees statement
 */
export async function exportStudentFeesToExcel(onProgress) {
  try {
    if (onProgress) onProgress('Fetching profile details...')
    const profile = await fetchStudentProfile()
    
    if (onProgress) onProgress('Fetching fee history...')
    const fees = await fetchStudentFees()

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Raj Tuition Classes'
    workbook.lastModifiedBy = 'Raj Tuition Classes'
    workbook.created = new Date()

    const sheet = workbook.addWorksheet('Fee Statement')
    sheet.views = [{ showGridLines: true }]

    // Styling constants
    const primaryBlue = '1E3A8A' // Navy Blue
    const headerBlue = '2563EB' // Brand Blue
    const darkText = '1E293B'
    const whiteText = 'FFFFFF'
    const borderStyle = { style: 'thin', color: { argb: 'CBD5E1' } }

    // --- 1. Top Header Section ---
    sheet.mergeCells(1, 1, 1, 5)
    const titleCell = sheet.getCell(1, 1)
    titleCell.value = 'RAJ TUITION CLASSES'
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: whiteText } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryBlue } }
    sheet.getRow(1).height = 35

    sheet.mergeCells(2, 1, 2, 5)
    const subCell = sheet.getCell(2, 1)
    subCell.value = 'STUDENT FEE STATEMENT'
    subCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: whiteText } }
    subCell.alignment = { horizontal: 'center', vertical: 'middle' }
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBlue } }
    sheet.getRow(2).height = 25

    // Row 3: Meta info
    sheet.getRow(3).height = 25
    
    const metaInfo = [
      { label: 'Student Name:', val: profile.name, colLabel: 1, colVal: 2 },
      { label: 'Class:', val: profile.className, colLabel: 4, colVal: 5 }
    ]

    metaInfo.forEach(({ label, val, colLabel, colVal }) => {
      const cLabel = sheet.getCell(3, colLabel)
      cLabel.value = label
      cLabel.font = { name: 'Arial', size: 10, bold: true, color: { argb: '475569' } }
      cLabel.alignment = { horizontal: 'left', vertical: 'middle' }

      const cVal = sheet.getCell(3, colVal)
      cVal.value = val
      cVal.font = { name: 'Arial', size: 10, bold: true, color: { argb: darkText } }
      cVal.alignment = { horizontal: 'left', vertical: 'middle' }
    })

    // Row 4: Generated Date
    sheet.getRow(4).height = 25
    const dateLabel = sheet.getCell(4, 1)
    dateLabel.value = 'Generated Date:'
    dateLabel.font = { name: 'Arial', size: 10, bold: true, color: { argb: '475569' } }
    dateLabel.alignment = { horizontal: 'left', vertical: 'middle' }

    const dateVal = sheet.getCell(4, 2)
    const currentDateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
    dateVal.value = currentDateStr
    dateVal.font = { name: 'Arial', size: 10, bold: true, color: { argb: darkText } }
    dateVal.alignment = { horizontal: 'left', vertical: 'middle' }

    // Row 5: Spacer Row
    sheet.getRow(5).height = 15

    // --- 2. Table Headers ---
    const headers = ['Month', 'Year', 'Status', 'Pending Amount', 'Payment Date']
    sheet.getRow(6).height = 25
    headers.forEach((h, idx) => {
      const cell = sheet.getCell(6, idx + 1)
      cell.value = h
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: whiteText } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryBlue } }
      cell.alignment = { horizontal: idx === 3 ? 'right' : (idx === 0 ? 'left' : 'center'), vertical: 'middle', indent: idx === 0 ? 1 : 0 }
      cell.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle }
    })

    // --- 3. Fill Table Records ---
    let startRow = 7
    let totalPaid = 0
    let totalPending = 0
    let totalPendingAmt = 0

    fees.forEach((fee, idx) => {
      const currentR = startRow + idx
      const row = sheet.getRow(currentR)
      row.height = 22

      const statusNorm = (fee.status || '').toLowerCase()
      if (statusNorm === 'paid') {
        totalPaid++
      } else {
        totalPending++
        totalPendingAmt += Number(fee.pendingAmount || 0)
      }

      const cMonth = row.getCell(1)
      cMonth.value = fee.month || 'N/A'
      cMonth.font = { name: 'Arial', size: 10, color: { argb: darkText } }
      cMonth.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }

      const cYear = row.getCell(2)
      cYear.value = fee.year || 0
      cYear.font = { name: 'Arial', size: 10, color: { argb: darkText } }
      cYear.alignment = { horizontal: 'center', vertical: 'middle' }

      const cStatus = row.getCell(3)
      cStatus.value = statusNorm.charAt(0).toUpperCase() + statusNorm.slice(1)
      cStatus.font = { 
        name: 'Arial', 
        size: 10, 
        bold: true,
        color: { argb: statusNorm === 'paid' ? '16A34A' : 'DC2626' } 
      }
      cStatus.alignment = { horizontal: 'center', vertical: 'middle' }

      const cAmt = row.getCell(4)
      cAmt.value = Number(fee.pendingAmount || 0)
      cAmt.numFmt = '₹#,##0'
      cAmt.font = { name: 'Arial', size: 10, color: { argb: darkText } }
      cAmt.alignment = { horizontal: 'right', vertical: 'middle' }

      const cDate = row.getCell(5)
      cDate.value = fee.paymentDate ? fee.paymentDate : '----'
      cDate.font = { name: 'Arial', size: 10, color: { argb: darkText } }
      cDate.alignment = { horizontal: 'center', vertical: 'middle' }

      // Borders & striping
      const isOdd = currentR % 2 === 1
      const cells = [cMonth, cYear, cStatus, cAmt, cDate]
      cells.forEach(c => {
        c.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle }
        if (isOdd) {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } }
        }
      })
    })

    // --- 4. Summary Section ---
    const summaryStartRow = startRow + fees.length + 2
    
    // Header for Summary Table
    sheet.getRow(summaryStartRow).height = 25
    const sumHeaderCols = ['Metric', 'Value']
    sumHeaderCols.forEach((h, idx) => {
      const cell = sheet.getCell(summaryStartRow, idx + 1)
      cell.value = h
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: whiteText } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } }
      cell.alignment = { horizontal: idx === 0 ? 'left' : 'right', vertical: 'middle', indent: idx === 0 ? 1 : 0 }
      cell.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle }
    })

    const summaryRows = [
      { metric: 'Total Paid Months', val: totalPaid, isCurrency: false },
      { metric: 'Total Pending Months', val: totalPending, isCurrency: false },
      { metric: 'Total Pending Amount', val: totalPendingAmt, isCurrency: true }
    ]

    summaryRows.forEach((item, idx) => {
      const currentR = summaryStartRow + 1 + idx
      const row = sheet.getRow(currentR)
      row.height = 22

      const cellMetric = row.getCell(1)
      cellMetric.value = item.metric
      cellMetric.font = { name: 'Arial', size: 10, bold: true, color: { argb: darkText } }
      cellMetric.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }

      const cellVal = row.getCell(2)
      cellVal.value = item.val
      cellVal.font = { name: 'Arial', size: 10, bold: true, color: { argb: idx === 2 && item.val > 0 ? 'DC2626' : (idx === 0 ? '16A34A' : darkText) } }
      cellVal.alignment = { horizontal: 'right', vertical: 'middle' }
      
      if (item.isCurrency) {
        cellVal.numFmt = '₹#,##0'
      }

      [cellMetric, cellVal].forEach(c => {
        c.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle }
        if (currentR % 2 === 1) {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } }
        }
      })
    })

    // Set Column Widths
    sheet.columns.forEach((column, idx) => {
      if (idx === 0) column.width = 24
      else if (idx === 1) column.width = 12
      else if (idx === 2) column.width = 15
      else if (idx === 3) column.width = 18
      else if (idx === 4) column.width = 18
    })

    if (onProgress) onProgress('Downloading Excel file...')
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // RTC_Fees_[StudentName]_[CurrentDate].xlsx
    const cleanStudentName = (profile.name || 'Student').toUpperCase().replace(/[^A-Z0-9]/g, '_')
    const todayDate = new Date().toISOString().slice(0, 10)
    saveAs(blob, `RTC_Fees_${cleanStudentName}_${todayDate}.xlsx`)

    return { success: true }
  } catch (error) {
    console.error('Student Fees Export Error:', error)
    return { success: false, reason: 'ERROR', message: error.message }
  }
}

/**
 * Generate and download Excel sheet for monthly fees report of all classes (Teacher side)
 */
export async function exportTeacherMonthlyFeesToExcel(classFilter, year, onProgress) {
  try {
    if (onProgress) onProgress('Fetching students data...')
    let studentsList = await fetchStudents()
    if (!studentsList || studentsList.length === 0) {
      throw new Error('No students found.')
    }

    if (classFilter && classFilter !== 'All') {
      studentsList = studentsList.filter(s => s.className === classFilter)
    }

    if (studentsList.length === 0) {
      return { success: false, reason: 'NO_DATA' }
    }

    if (onProgress) onProgress('Fetching annual fees records...')
    // Fetch all fees records for selected year
    const { data: feesData, error: feesError } = await supabase
      .from('fees')
      .select('student_id, status, pending_amount, payment_date, month')
      .eq('year', String(year))

    if (feesError) {
      throw new Error(feesError.message || 'Unable to fetch fees data.')
    }

    // Filter fees data to only include students in studentsList
    const studentIds = new Set(studentsList.map(s => s.id))
    const filteredFees = (feesData || []).filter(fee => studentIds.has(fee.student_id))

    // Determine months that have at least one record in the database for these students
    const activeMonths = MONTHS.filter(mName => filteredFees.some(fee => fee.month === mName))

    if (activeMonths.length === 0) {
      return { success: false, reason: 'NO_DATA' }
    }

    // Map fees records to studentId -> month -> fee
    const feeMap = new Map()
    filteredFees.forEach(fee => {
      if (!feeMap.has(fee.student_id)) {
        feeMap.set(fee.student_id, new Map())
      }
      feeMap.get(fee.student_id).set(fee.month, fee)
    })

    // Group students by class level (e.g. 6th, 7th, ...)
    const studentsByClass = studentsList.reduce((acc, student) => {
      const cls = student.className || 'Unassigned'
      if (!acc[cls]) {
        acc[cls] = []
      }
      acc[cls].push(student)
      return acc
    }, {})

    // Unique sorted class list (from students, e.g. 6th, 7th, 8th...)
    const sortedClasses = Object.keys(studentsByClass).sort((a, b) => {
      const getNum = (str) => parseInt(str) || 999
      return getNum(a) - getNum(b)
    })

    if (sortedClasses.length === 0) {
      return { success: false, reason: 'NO_DATA' }
    }

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Raj Tuition Classes'
    workbook.lastModifiedBy = 'Raj Tuition Classes'
    workbook.created = new Date()

    // Styling constants
    const primaryBlue = '1E3A8A' // Navy Blue
    const headerBlue = '2563EB' // Brand Blue
    const darkText = '1E293B'
    const whiteText = 'FFFFFF'
    const borderStyle = { style: 'thin', color: { argb: 'CBD5E1' } }
    const headerBorder = { style: 'medium', color: { argb: '1E3A8A' } }

    const totalCols = 5 + activeMonths.length * 2
    let totalStudentCount = 0

    // Process each class as its own sheet
    for (const classLevel of sortedClasses) {
      const classStudents = studentsByClass[classLevel] || []
      totalStudentCount += classStudents.length

      // Sheet name (max 31 chars)
      const cleanSheetName = classLevel.replace(new RegExp('[\\\\/?:*]', 'g'), '').replace(/\[/g, '').replace(/\]/g, '').slice(0, 31)
      const sheet = workbook.addWorksheet(cleanSheetName || 'Class', {
        views: [{ state: 'frozen', ySplit: 6, showGridLines: true }]
      })

      // --- 1. Top Header Section ---
      sheet.mergeCells(1, 1, 1, totalCols)
      const r1 = sheet.getCell(1, 1)
      r1.value = 'RAJ TUITION CLASSES'
      r1.font = { name: 'Arial', size: 16, bold: true, color: { argb: whiteText } }
      r1.alignment = { horizontal: 'center', vertical: 'middle' }
      r1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryBlue } }
      sheet.getRow(1).height = 35

      sheet.mergeCells(2, 1, 2, totalCols)
      const r2 = sheet.getCell(2, 1)
      r2.value = `ANNUAL FEES REPORT - ${year}`
      r2.font = { name: 'Arial', size: 12, bold: true, color: { argb: whiteText } }
      r2.alignment = { horizontal: 'center', vertical: 'middle' }
      r2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBlue } }
      sheet.getRow(2).height = 25

      // Row 3 & 4: Meta Info
      sheet.getRow(3).height = 20
      sheet.getCell(3, 1).value = 'Year:'
      sheet.getCell(3, 1).font = { name: 'Arial', size: 10, bold: true, color: { argb: '475569' } }
      sheet.getCell(3, 2).value = String(year)
      sheet.getCell(3, 2).font = { name: 'Arial', size: 10, bold: true, color: { argb: darkText } }

      sheet.getCell(3, 4).value = 'Class:'
      sheet.getCell(3, 4).font = { name: 'Arial', size: 10, bold: true, color: { argb: '475569' } }
      sheet.getCell(3, 5).value = classLevel
      sheet.getCell(3, 5).font = { name: 'Arial', size: 10, bold: true, color: { argb: darkText } }

      sheet.getRow(4).height = 15 // Spacer row

      // --- 2. Table Headers (Row 5 & Row 6) ---
      sheet.mergeCells(5, 1, 6, 1)
      const hName = sheet.getCell(5, 1)
      hName.value = 'Student Name'
      
      sheet.mergeCells(5, 2, 6, 2)
      const hPhone = sheet.getCell(5, 2)
      hPhone.value = 'Phone'

      // Monthly headers (Cols 3 to totalCols - 3)
      activeMonths.forEach((mName, mIdx) => {
        const startCol = 3 + mIdx * 2
        const endCol = startCol + 1
        
        sheet.mergeCells(5, startCol, 5, endCol)
        const hMonth = sheet.getCell(5, startCol)
        hMonth.value = mName
        hMonth.font = { name: 'Arial', size: 10, bold: true, color: { argb: whiteText } }
        hMonth.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryBlue } }
        hMonth.alignment = { horizontal: 'center', vertical: 'middle' }
        hMonth.border = { top: headerBorder, bottom: borderStyle, left: borderStyle, right: borderStyle }

        const hSubStatus = sheet.getCell(6, startCol)
        hSubStatus.value = 'Status'
        hSubStatus.font = { name: 'Arial', size: 9, bold: true, color: { argb: whiteText } }
        hSubStatus.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } }
        hSubStatus.alignment = { horizontal: 'center', vertical: 'middle' }
        hSubStatus.border = { top: borderStyle, bottom: headerBorder, left: borderStyle, right: borderStyle }

        const hSubDetail = sheet.getCell(6, endCol)
        hSubDetail.value = 'Date/Amt'
        hSubDetail.font = { name: 'Arial', size: 9, bold: true, color: { argb: whiteText } }
        hSubDetail.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } }
        hSubDetail.alignment = { horizontal: 'center', vertical: 'middle' }
        hSubDetail.border = { top: borderStyle, bottom: headerBorder, left: borderStyle, right: borderStyle }
      })

      // Summary headers (Cols totalCols - 2 to totalCols)
      const colPaidMonths = totalCols - 2
      const colPendMonths = totalCols - 1
      const colTotalPend = totalCols

      sheet.mergeCells(5, colPaidMonths, 6, colPaidMonths)
      const hPaidMonths = sheet.getCell(5, colPaidMonths)
      hPaidMonths.value = 'Paid Months'

      sheet.mergeCells(5, colPendMonths, 6, colPendMonths)
      const hPendMonths = sheet.getCell(5, colPendMonths)
      hPendMonths.value = 'Pending Months'

      sheet.mergeCells(5, colTotalPend, 6, colTotalPend)
      const hTotalPend = sheet.getCell(5, colTotalPend)
      hTotalPend.value = 'Total Pending'

      // Style vertically merged header cells
      const vertMergedCells = [hName, hPhone, hPaidMonths, hPendMonths, hTotalPend]
      vertMergedCells.forEach(cell => {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: whiteText } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryBlue } }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        
        const startRow = cell.row
        const startCol = cell.col
        const endRow = cell.row + (cell.rowSpan ? cell.rowSpan - 1 : 1)
        for (let r = startRow; r <= endRow; r++) {
          sheet.getCell(r, startCol).border = { top: headerBorder, bottom: headerBorder, left: borderStyle, right: borderStyle }
          sheet.getCell(r, startCol).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryBlue } }
        }
      })

      sheet.getRow(5).height = 22
      sheet.getRow(6).height = 20

      // --- 3. Fill Table Records ---
      let startRow = 7
      let totalClassPendingAmt = 0

      classStudents.forEach((student, sIdx) => {
        const currentR = startRow + sIdx
        const row = sheet.getRow(currentR)
        row.height = 22

        const cName = row.getCell(1)
        cName.value = student.name || 'N/A'
        cName.font = { name: 'Arial', size: 10, color: { argb: darkText } }
        cName.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }

        const cPhone = row.getCell(2)
        cPhone.value = student.phone || '----'
        cPhone.font = { name: 'Arial', size: 10, color: { argb: darkText } }
        cPhone.alignment = { horizontal: 'center', vertical: 'middle' }

        let paidMonthsCount = 0
        let pendingMonthsCount = 0
        let studentPendingAmtSum = 0

        // Fill month columns (using only activeMonths)
        activeMonths.forEach((mName, mIdx) => {
          const startCol = 3 + mIdx * 2
          const endCol = startCol + 1

          const fee = feeMap.get(student.id)?.get(mName)

          let status = '*'
          let detail = '*'
          let isPaid = false
          let isPending = false
          let hasRecord = false

          if (fee) {
            hasRecord = true
            const rawStatus = (fee.status || '').toLowerCase()
            if (rawStatus === 'paid') {
              status = 'Paid'
              detail = fee.payment_date || fee.paymentDate || '----'
              isPaid = true
            } else {
              status = 'Pending'
              detail = Number(fee.pending_amount ?? fee.pendingAmount ?? 0)
              isPending = true
            }
          }

          if (isPaid) {
            paidMonthsCount++
          } else if (isPending) {
            pendingMonthsCount++
            studentPendingAmtSum += detail
          }

          // Status cell (Green for Paid, Red for Pending, Slate for *)
          const cStatus = row.getCell(startCol)
          cStatus.value = status
          if (hasRecord) {
            cStatus.font = { name: 'Arial', size: 10, bold: true, color: { argb: isPaid ? '16A34A' : 'DC2626' } }
          } else {
            cStatus.font = { name: 'Arial', size: 10, color: { argb: '94A3B8' } }
          }
          cStatus.alignment = { horizontal: 'center', vertical: 'middle' }

          // Detail cell (payment date, amount or *)
          const cDetail = row.getCell(endCol)
          cDetail.value = detail
          cDetail.font = { name: 'Arial', size: 10, color: { argb: hasRecord ? darkText : '94A3B8' } }
          cDetail.alignment = { horizontal: 'center', vertical: 'middle' }

          if (isPending) {
            cDetail.numFmt = '₹#,##0'
            cDetail.alignment = { horizontal: 'right', vertical: 'middle' }
          }
        })

        totalClassPendingAmt += studentPendingAmtSum

        // Paid Months count
        const cPaidCount = row.getCell(colPaidMonths)
        cPaidCount.value = paidMonthsCount
        cPaidCount.font = { name: 'Arial', size: 10, bold: true, color: { argb: '16A34A' } }
        cPaidCount.alignment = { horizontal: 'center', vertical: 'middle' }

        // Pending Months count
        const cPendCount = row.getCell(colPendMonths)
        cPendCount.value = pendingMonthsCount
        cPendCount.font = { name: 'Arial', size: 10, bold: true, color: { argb: pendingMonthsCount > 0 ? 'DC2626' : darkText } }
        cPendCount.alignment = { horizontal: 'center', vertical: 'middle' }

        // Total Pending Amount
        const cTotalPendAmt = row.getCell(colTotalPend)
        cTotalPendAmt.value = studentPendingAmtSum
        cTotalPendAmt.numFmt = '₹#,##0'
        cTotalPendAmt.font = { name: 'Arial', size: 10, bold: true, color: { argb: studentPendingAmtSum > 0 ? 'DC2626' : darkText } }
        cTotalPendAmt.alignment = { horizontal: 'right', vertical: 'middle' }

        // Alternating row styling & borders
        const isOdd = currentR % 2 === 1
        for (let c = 1; c <= totalCols; c++) {
          const cell = row.getCell(c)
          cell.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle }
          if (isOdd) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } }
          }
        }
      })

      // --- 4. Bottom Summary Section ---
      const summaryStartRow = startRow + classStudents.length + 2
      
      sheet.getRow(summaryStartRow).height = 25
      const sumHeaderCols = ['Metric', 'Value']
      sumHeaderCols.forEach((h, idx) => {
        const cell = sheet.getCell(summaryStartRow, idx + 1)
        cell.value = h
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: whiteText } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } }
        cell.alignment = { horizontal: idx === 0 ? 'left' : 'right', vertical: 'middle', indent: idx === 0 ? 1 : 0 }
        cell.border = { top: headerBorder, bottom: headerBorder, left: borderStyle, right: borderStyle }
      })

      const summaries = [
        { metric: 'Total Students', val: classStudents.length, isCurrency: false },
        { metric: 'Total Class Pending Amount', val: totalClassPendingAmt, isCurrency: true }
      ]

      summaries.forEach((item, idx) => {
        const currentR = summaryStartRow + 1 + idx
        const row = sheet.getRow(currentR)
        row.height = 22

        const cellMetric = row.getCell(1)
        cellMetric.value = item.metric
        cellMetric.font = { name: 'Arial', size: 10, bold: true, color: { argb: darkText } }
        cellMetric.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }

        const cellVal = row.getCell(2)
        cellVal.value = item.val
        cellVal.font = { 
          name: 'Arial', 
          size: 10, 
          bold: true, 
          color: { argb: item.isCurrency && item.val > 0 ? 'DC2626' : darkText } 
        }
        cellVal.alignment = { horizontal: 'right', vertical: 'middle' }

        if (item.isCurrency) {
          cellVal.numFmt = '₹#,##0'
        }

        [cellMetric, cellVal].forEach(c => {
          c.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle }
          if (currentR % 2 === 1) {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } }
          }
        })
      })

      // Column widths configuration
      sheet.getColumn(1).width = 24  // Name
      sheet.getColumn(2).width = 15  // Phone
      activeMonths.forEach((_, mIdx) => {
        sheet.getColumn(3 + mIdx * 2).width = 10     // Month Status
        sheet.getColumn(4 + mIdx * 2).width = 14     // Month Date/Amt
      })
      sheet.getColumn(colPaidMonths).width = 14 // Paid Months summary
      sheet.getColumn(colPendMonths).width = 14 // Pending Months summary
      sheet.getColumn(colTotalPend).width = 20  // Total Pending Amount summary
    }

    if (totalStudentCount === 0) {
      return { success: false, reason: 'NO_DATA' }
    }

    if (onProgress) onProgress('Downloading Excel file...')
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    const cleanClassName = classFilter.replace(new RegExp('[\\\\/?:*]', 'g'), '').replace(/\[/g, '').replace(/\]/g, '').replace(/\s+/g, '_')
    saveAs(blob, `RTC_Fees_Report_${cleanClassName}_${year}.xlsx`)

    return { success: true }
  } catch (error) {
    console.error('Teacher Fees Export Error:', error)
    return { success: false, reason: 'ERROR', message: error.message }
  }
}
