import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { Header } from './Header'
import ErrorPage from './ErrorPage'
import LoadingPage from './LoadingPage'
import { Container } from './Container'
import { Button } from './Button'
import Lightbox from 'yet-another-react-lightbox'
import { toast } from 'react-toastify'
import { convertUTCDateToLocalDate } from '@/pages/user'
const XLSX = require('xlsx')

const Tab = ({ children }) => {
  return <div>{children}</div>
}

function createExcelFile(PagesAndData, DateMap, filename) {
  // Create a new workbook
  const wb = XLSX.utils.book_new()

  // Convert the data to a worksheet
  Object.keys(DateMap).forEach((intValue) => {
    const ws = XLSX.utils.json_to_sheet(PagesAndData[DateMap[intValue]])
    XLSX.utils.book_append_sheet(wb, ws, DateMap[intValue].replaceAll('/', '-'))
  })

  // Write the workbook to a file
  XLSX.writeFile(wb, filename)
}

const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(children[0].props.label)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {children.map((child) => {
          const { label } = child.props

          return (
            <button
              className={`rounded-full border border-slate-300 bg-slate-200 px-8 py-2 text-sm text-slate-900 transition-colors duration-200 hover:bg-slate-300 hover:text-slate-800 ${
                activeTab == label ? '!bg-slate-700 !text-slate-200' : ''
              }`}
              onClick={() => setActiveTab(label)}
              key={label}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div>
        {children.map((child) => {
          if (child.props.label !== activeTab) return undefined
          return child.props.children
        })}
      </div>
    </div>
  )
}

// Usage
function AdminPage({ userData }) {
  return (
    <section>
      <Header />
      <Container>
        <section className="container mx-auto flex flex-col gap-6 px-4">
          <div class="flex items-center justify-between pb-2">
            <div className="h-fit text-2xl font-semibold">
              Welcome, <span className="capitalize">{userData.name}</span>
            </div>
          </div>
          <Tabs>
            <Tab label="Approvals">
              <ApprovalPage />
            </Tab>
            <Tab label="All Activities">
              <AllAttendances />
            </Tab>
            <Tab label="Outside Students">
              <StillOutStudents />
            </Tab>
            <Tab label="Unknown Detected Faces">
              <AllUnknownDetectedFaces />
            </Tab>
          </Tabs>
        </section>
      </Container>
    </section>
  )
}

const ApprovalPage = () => {
  const [openImages, setOpenImages] = useState(false)
  const [openInstituteID, setOpenInstituteID] = useState(false)
  const [studentImagesGallery, setStudentImagesGallery] = useState([])
  const [studentInstituteID, setStudentInstituteID] = useState([])
  const [loading, setLoading] = useState('loading')
  const [studentData, setStudentData] = useState([])

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/attendance/allStudents/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((res) => {
        console.log(res.data)
        setStudentData(res.data.data)
        setLoading('done')
      })
      .catch((err) => {
        toast.error('Error fetching student data' + err.response.data.message)
        setLoading('error')
      })
  }, [])
  const Approval = (student_id, verdict) => {
    axios
      .put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/attendance/user/${student_id}/`,
        {
          verified: verdict,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      .then((res) => {
        console.log(res)
        toast.success(`Student ${verdict}`)
        setStudentData(
          studentData.map((student) => {
            if (student.id == student_id) {
              student.verified = verdict
            }
            return student
          })
        )
      })
      .catch((err) => {
        toast.error('Error:' + err.response.data.message)
      })
  }
  if (loading == 'loading') {
    return <LoadingPage className={'!h-full !w-full !py-20'} />
  }
  if (loading == 'error') {
    return <ErrorPage className={'!h-full !w-full !py-20'} />
  }
  return (
    <>
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden border border-gray-200  md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 border-t-4 border-green-400">
              <thead className="bg-gray-50 ">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-12 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                  >
                    Images
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                  >
                    Institute ID
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white  ">
                {studentData.map((studentInfo, ind) => (
                  <tr key={ind} className="transition hover:bg-slate-200">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                      <div>
                        <h2 className="font-medium text-gray-800  ">
                          {studentInfo.roll_number}
                        </h2>
                      </div>
                    </td>
                    {studentInfo.uploaded_images &&
                    studentInfo.uploaded_images.length > 0 ? (
                      <td
                        className="whitespace-nowrap px-8 py-4 text-sm"
                        onClick={() => {
                          setStudentImagesGallery(
                            studentInfo.uploaded_images.map((imageSrc) => ({
                              src: imageSrc,
                            }))
                          )
                          setOpenImages(true)
                        }}
                      >
                        <div className="flex items-center">
                          {studentInfo.uploaded_images
                            .slice(0, 4)
                            .map((studentImage, ind) => (
                              <img
                                key={ind}
                                className="-mx-1 h-6 w-6 shrink-0 cursor-pointer rounded-full border-2 border-white  object-cover"
                                src={studentImage}
                                alt=""
                              />
                            ))}
                          {studentInfo.uploaded_images.length > 4 && (
                            <p className="-mx-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-100 text-xs text-blue-600">
                              +{studentInfo.uploaded_images.length - 4}
                            </p>
                          )}
                        </div>
                      </td>
                    ) : (
                      <td className="px-8 py-4">No Images</td>
                    )}
                    {studentInfo.college_id_card ? (
                      <td
                        className="whitespace-nowrap px-4 py-4 text-sm"
                        onClick={() => {
                          setStudentInstituteID([
                            { src: studentInfo.college_id_card },
                          ])
                          setOpenInstituteID(true)
                        }}
                      >
                        <div className="flex items-center">
                          <img
                            className="-mx-1 h-6 w-6 shrink-0 cursor-pointer rounded-full border-2 border-white  object-cover"
                            src={studentInfo.college_id_card}
                            alt=""
                          />
                        </div>
                      </td>
                    ) : (
                      <td className="px-2 py-4">No Images</td>
                    )}
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                      <div
                        className={`inline rounded-full px-3 py-2 text-sm font-normal ${
                          {
                            'in queue': 'bg-yellow-100/60 text-yellow-500',
                            accepted: 'bg-emerald-100/60 text-emerald-500',
                            rejected: 'bg-red-100/60 text-red-500',
                          }[studentInfo.verified]
                        } gap-x-2`}
                      >
                        {studentInfo.verified}
                      </div>
                    </td>
                    {studentInfo.verified != 'in queue' ? (
                      <td className="flex gap-4 whitespace-nowrap px-4 py-4 text-sm">
                        <div
                          className="w-fit cursor-pointer rounded-lg bg-gray-100 px-3 py-2 text-gray-500 transition-colors duration-200 hover:bg-yellow-100/60 hover:text-yellow-500"
                          onClick={() => {
                            Approval(studentInfo.id, 'in queue')
                          }}
                        >
                          Edit
                        </div>
                      </td>
                    ) : (
                      <td className="flex gap-4 whitespace-nowrap px-4 py-4 text-sm">
                        <div
                          className="w-fit cursor-pointer rounded-lg bg-gray-100 px-3 py-2 text-gray-500 transition-colors duration-200 hover:bg-green-100/60 hover:text-green-500"
                          onClick={() => {
                            Approval(studentInfo.id, 'accepted')
                          }}
                        >
                          Accept
                        </div>
                        <div
                          className="w-fit cursor-pointer rounded-lg bg-gray-100 px-3 py-2 text-gray-500 transition-colors duration-200 hover:bg-red-100/60 hover:text-red-500"
                          onClick={() => {
                            Approval(studentInfo.id, 'rejected')
                          }}
                        >
                          Reject
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                <Lightbox
                  open={
                    openImages
                      ? openImages
                      : openInstituteID
                      ? openInstituteID
                      : null
                  }
                  close={
                    openImages
                      ? () => setOpenImages(false)
                      : openInstituteID
                      ? () => setOpenInstituteID(false)
                      : null
                  }
                  slides={
                    openImages
                      ? studentImagesGallery
                      : openInstituteID
                      ? studentInstituteID
                      : null
                  }
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-6 sm:flex sm:items-center sm:justify-between ">
        <div className="text-sm text-gray-500 ">
          Page <span className="font-medium text-gray-700 ">1 of 1</span>
        </div>
        <div className="mt-4 flex items-center gap-x-4 sm:mt-0">
          <a
            href="#"
            className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-5 py-2 text-sm capitalize text-gray-700 transition-colors duration-200 hover:bg-gray-100 sm:w-auto    "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5 rtl:-scale-x-100"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
              />
            </svg>
            <span>previous</span>
          </a>
          <a
            href="#"
            className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-5 py-2 text-sm capitalize text-gray-700 transition-colors duration-200 hover:bg-gray-100 sm:w-auto    "
          >
            <span>Next</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5 rtl:-scale-x-100"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </>
  )
}

const AllAttendances = () => {
  const [loading, setLoading] = useState('loading')
  const [AllAttendances, setAllAttendances] = useState([])
  const [filteredAttendances, setFilteredAttendances] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const SelectedDateDate = useMemo(
    () => new Date(selectedDate).toLocaleDateString(),
    [selectedDate]
  )
  useEffect(() => {
    setLoading('loading')
    const Notification = toast.loading('Fetching attendance, please wait...')
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/attendance/getAllAttendance/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      .then((res) => {
        setLoading('done')
        toast.update(Notification, {
          render: 'Attendance fetched successfully',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        })
        setAllAttendances(res.data.data)
      })
      .catch((err) => {
        toast.update(Notification, {
          render: err.response.data.message,
          type: 'error',
          isLoading: false,
          autoClose: 2000,
        })
      })
  }, [])

  useEffect(() => {
    setFilteredAttendances(
      AllAttendances.filter(
        (attendance) =>
          new Date(attendance.out_time).toLocaleDateString() ==
            SelectedDateDate ||
          (attendance.in_time &&
            new Date(attendance.in_time).toLocaleDateString() ==
              SelectedDateDate)
      )
    )
  }, [SelectedDateDate, AllAttendances])

  if (loading == 'loading') {
    return <LoadingPage className={'!h-full !w-full !py-20'} />
  }
  if (loading == 'error') {
    return <ErrorPage className={'!h-full !w-full !py-20'} />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold">
          Daily In-Out for Date: {SelectedDateDate}
        </p>
        <div className="mt-4 flex items-center justify-end gap-x-4 sm:mt-0">
          <div
            className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-5 py-2 text-sm capitalize text-gray-700 transition-colors duration-200 hover:bg-gray-100 sm:w-auto"
            onClick={() => {
              setSelectedDate(
                new Date(new Date(selectedDate).getTime() - 24 * 60 * 60 * 1000)
              )
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5 rtl:-scale-x-100"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
              />
            </svg>
            <span>Previous Day</span>
          </div>
          {SelectedDateDate != new Date().toLocaleDateString() && (
            <div
              className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-5 py-2 text-sm capitalize text-gray-700 transition-colors duration-200 hover:bg-gray-100 sm:w-auto"
              onClick={() => {
                setSelectedDate(
                  new Date(
                    new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000
                  )
                )
              }}
            >
              <span>Next Day</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5 rtl:-scale-x-100"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden border border-gray-200  md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 border-t-4 border-green-400">
              <thead className="bg-gray-50 ">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                  >
                    Sr. No.
                  </th>
                  <th
                    scope="col"
                    className="px-12 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                  >
                    Roll Number
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                  >
                    Out-Time
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                  >
                    In-Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white  ">
                {filteredAttendances.map((attendance, ind) => (
                  <tr key={ind} className="transition hover:bg-slate-200">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                      {ind + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                      {attendance.student_table.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                      {attendance.student_table.roll_number}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                      {convertUTCDateToLocalDate(attendance.out_time).replace(
                        SelectedDateDate + ' / ',
                        ''
                      )}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-4 text-sm font-medium ${
                        attendance.in_time ?? 'pl-10'
                      }`}
                    >
                      {attendance.in_time
                        ? convertUTCDateToLocalDate(attendance.in_time).replace(
                            SelectedDateDate + ' / ',
                            ''
                          )
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          // href="https://docs.google.com/spreadsheets/d/1TPHKBIs39hieXIagqxQiOURpmk9N1ZCdjy_mOP5aV-g/edit?ouid=115377998625812916764&usp=sheets_home&ths=true"
          className={
            'group inline-flex cursor-pointer items-center justify-center rounded-full !bg-[#118e0d] px-4 py-2 text-sm font-semibold text-white hover:!bg-[#118e0dd8] hover:bg-slate-700 hover:text-slate-100 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 active:bg-slate-800 active:text-slate-300'
          }
          // target="_blank"
          onClick={() => {
            const PagesAndData = {}
            const dateMap = {}
            AllAttendances.forEach((attendance) => {
              const stDate = new Date(attendance.out_time).toLocaleDateString()
              const edDate = attendance.in_time
                ? new Date(attendance.in_time).toLocaleDateString()
                : '-'
              const stTime = new Date(attendance.out_time).toLocaleTimeString()
              const edTime = attendance.in_time
                ? new Date(attendance.in_time).toLocaleTimeString()
                : '-'
              dateMap[
                new Date(
                  new Date(
                    new Date(attendance.out_time).toDateString()
                  ).getTime()
                ).getTime()
              ] = stDate
              if (edDate != '-')
                dateMap[
                  new Date(
                    new Date(
                      new Date(attendance.in_time).toDateString()
                    ).getTime()
                  ).getTime()
                ] = edDate

              if (!PagesAndData[stDate]) PagesAndData[stDate] = []
              PagesAndData[stDate].push({
                Name: attendance.student_table.name,
                'Roll Number': attendance.student_table.roll_number,
                'Out Time': stTime,
                'In Time':
                  stDate == edDate
                    ? edTime
                    : edDate != '-'
                    ? `${edDate} / ${edTime}`
                    : '-',
              })
              if (edDate != '-' && edDate != stDate) {
                if (!PagesAndData[edDate]) PagesAndData[edDate] = []
                PagesAndData[edDate].push({
                  Name: attendance.student_table.name,
                  'Roll Number': attendance.student_table.roll_number,
                  'Out Time': `${stDate} / ${stTime}`,
                  'In Time': edTime,
                })
              }
            })
            console.log({ PagesAndData, dateMap, keys: Object.keys(dateMap) })
            createExcelFile(PagesAndData, dateMap, 'Attendance.xlsx')
          }}
          rel="noreferrer"
        >
          Export Excel
        </button>
      </div>
    </div>
  )
}

const StillOutStudents = () => {
  const [loading, setLoading] = useState('loading')
  const [StillOutStudents, setStillOutStudents] = useState([])
  useEffect(() => {
    setLoading('loading')
    const Notification = toast.loading('Fetching attendance, please wait...')
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/attendance/stillOutStudents/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      .then((res) => {
        setLoading('done')
        toast.update(Notification, {
          render: 'Attendance fetched successfully',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        })
        setStillOutStudents(res.data.data)
        console.log(res.data.data)
      })
      .catch((err) => {
        toast.update(Notification, {
          render: err.response.data.message,
          type: 'error',
          isLoading: false,
          autoClose: 2000,
        })
      })
  }, [])
  if (loading == 'loading') {
    return <LoadingPage className={'!h-full !w-full !py-20'} />
  }
  if (loading == 'error') {
    return <ErrorPage className={'!h-full !w-full !py-20'} />
  }
  return (
    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
        <div className="overflow-hidden border border-gray-200  md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 border-t-4 border-green-400">
            <thead className="bg-gray-50 ">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                >
                  Sr. No.
                </th>
                <th
                  scope="col"
                  className="px-12 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                >
                  Roll Number
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                >
                  Phone Number
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                >
                  Out-Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white  ">
              {StillOutStudents.map((students, ind) => (
                <tr key={ind} className="transition hover:bg-slate-200">
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                    {ind + 1}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                    {students.student_table.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                    {students.student_table.roll_number}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-4 text-sm font-medium ${
                      students.in_time ?? 'pl-10'
                    }`}
                  >
                    {students.student_table.phone_number}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                    {convertUTCDateToLocalDate(students.out_time)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const AllUnknownDetectedFaces = () => {
  const [openImages, setOpenImages] = useState(false)
  const [openInstituteID, setOpenInstituteID] = useState(false)
  const [studentInstituteID, setStudentInstituteID] = useState([])
  const [loading, setLoading] = useState('loading')
  const [allUnknownFaces, setAllUnknownFaces] = useState([])

  const FetchData = () => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/attendance/getAllUnknownFaces/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      .then((res) => {
        setAllUnknownFaces(res.data.data)
        setLoading('done')
      })
      .catch((err) => {
        toast.error('Error fetching student data' + err.response.data.message)
        setLoading('error')
      })
  }

  useEffect(() => {
    FetchData()
    const intervalVar = setInterval(() => {
      FetchData()
    }, 30000)
    return () => {
      clearInterval(intervalVar)
    }
  }, [])
  const verify = (id) => {
    axios
      .put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/attendance/verifyUnknownFace/${id}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      .then((res) => {
        console.log(res)
        toast.success(`Unknown Verified`)
        setAllUnknownFaces(allUnknownFaces.filter((face) => face.id != id))
      })
      .catch((err) => {
        toast.error('Error:' + err.response.data.message)
      })
  }
  if (loading == 'loading') {
    return <LoadingPage className={'!h-full !w-full !py-20'} />
  }
  if (loading == 'error') {
    return <ErrorPage className={'!h-full !w-full !py-20'} />
  }
  return (
    <>
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden border border-gray-200  md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 border-t-4 border-green-400">
              <thead className="bg-gray-50 ">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                  >
                    Date/Time
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                  >
                    Institute ID
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 rtl:text-right "
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white  ">
                {allUnknownFaces.map((studentInfo, ind) => (
                  <tr key={ind} className="transition hover:bg-slate-200">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                      <div>
                        <h2 className="font-medium text-gray-800  ">
                          {convertUTCDateToLocalDate(studentInfo.time)}
                        </h2>
                      </div>
                    </td>
                    <td className="px-4 py-4">{studentInfo.location}</td>
                    <td
                      className="whitespace-nowrap px-4 py-4 text-sm"
                      onClick={() => {
                        setStudentInstituteID([
                          { src: studentInfo.captured_image_url },
                        ])
                        setOpenInstituteID(true)
                      }}
                    >
                      <div className="flex w-full items-center">
                        <img
                          className="-mx-1 h-6 w-6 shrink-0 cursor-pointer rounded-full border-2 border-white  object-cover"
                          src={studentInfo.captured_image_url}
                          alt=""
                        />
                      </div>
                    </td>
                    <td className="flex gap-4 whitespace-nowrap px-4 py-4 text-sm">
                      <div
                        className="w-fit cursor-pointer rounded-lg bg-gray-100 px-3 py-2 text-gray-500 transition-colors duration-200 hover:bg-green-100/60 hover:text-green-500"
                        onClick={() => {
                          verify(studentInfo.id)
                        }}
                      >
                        Verified
                      </div>
                    </td>
                  </tr>
                ))}
                <Lightbox
                  open={
                    openImages
                      ? openImages
                      : openInstituteID
                      ? openInstituteID
                      : null
                  }
                  close={
                    openImages
                      ? () => setOpenImages(false)
                      : openInstituteID
                      ? () => setOpenInstituteID(false)
                      : null
                  }
                  slides={openInstituteID ? studentInstituteID : null}
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-6 sm:flex sm:items-center sm:justify-between ">
        <div className="text-sm text-gray-500 ">
          Page <span className="font-medium text-gray-700 ">1 of 1</span>
        </div>
        <div className="mt-4 flex items-center gap-x-4 sm:mt-0">
          <a
            href="#"
            className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-5 py-2 text-sm capitalize text-gray-700 transition-colors duration-200 hover:bg-gray-100 sm:w-auto    "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5 rtl:-scale-x-100"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
              />
            </svg>
            <span>previous</span>
          </a>
          <a
            href="#"
            className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-5 py-2 text-sm capitalize text-gray-700 transition-colors duration-200 hover:bg-gray-100 sm:w-auto    "
          >
            <span>Next</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5 rtl:-scale-x-100"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </>
  )
}

export default AdminPage
