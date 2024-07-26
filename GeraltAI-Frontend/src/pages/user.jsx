import AdminPage from '@/components/AdminPage'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import ErrorPage from '@/components/ErrorPage'
import { Header } from '@/components/Header'
import LoadingPage from '@/components/LoadingPage'
import { useGlobalContext } from '@/context/globalContext'
import axios from 'axios'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { use, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

export default function User() {
  const { userDataLoadingStatus, userData } = useGlobalContext()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') {
      return null
    } else if (localStorage.getItem('token') === null) {
      window.location.href = '/login'
    }
  }, [])

  if (userDataLoadingStatus == 'loading') {
    return <LoadingPage />
  } else if (userDataLoadingStatus == 'error') {
    return <ErrorPage />
  }

  if (userData.role == 'admin') {
    return <AdminPage userData={userData} />
  } else if (userData.role == 'student') {
    return <StudentPage userData={userData} />
  } else {
    return <ErrorPage />
  }
}

export function convertUTCDateToLocalDate(date) {
  date = new Date(date)
  var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000)

  var offset = date.getTimezoneOffset() / 60
  var hours = date.getHours()

  newDate.setHours(hours - offset)

  return `${date.toLocaleDateString()} / ${date.toLocaleTimeString()}`
}

const StudentPage = ({ userData }) => {
  const [showOptions, setShowOptions] = useState(false)
  const router = useRouter()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (showOptions && !e.target.closest('.relative')) {
        setShowOptions(false)
      }
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [showOptions])

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    console.log(file)
    const formData = new FormData()
    formData.append('file', file)

    const Notification = toast.loading('Uploading ID-Card, please wait...')
    try {
      const response = await axios.post(
        `${backendUrl}/attendance/uploadIdCard/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      toast.update(Notification, {
        render: 'ID-Card Uploaded Successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      })

      window.location.reload()
    } catch (error) {
      console.log(error)
      toast.update(Notification, {
        render: error.response.data.message || 'An error occurred',
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      })
    }
  }

  return (
    <div className="h-screen w-screen bg-[#4a76a8]">
      <div className="bg-gray-100">
        <Header />
        <Container className="!max-w-5xl">
          <div className="no-wrap md:-mx-2 ">
            {/* upper Side */}
            <div className="grid md:grid-cols-[1fr_2fr] gap-5">
              <div className=" md:mx-2 md:w-full">
                {/* Profile Card */}
                <div className="w-full h-full rounded-sm border-t-4 border-green-400 bg-white p-3">
                  <div className="image overflow-hidden">
                    <img
                      className="mx-auto h-auto w-full"
                      src="https://lavinephotography.com.au/wp-content/uploads/2017/01/PROFILE-Photography-112.jpg"
                      alt=""
                    />
                  </div>
                  <h1 className="my-1 text-xl font-bold leading-8 text-gray-900">
                    {userData.name}
                  </h1>
                  <h3 className="font-lg text-semibold leading-6 text-gray-600">
                    {userData.student_table.roll_number}
                  </h3>
                  <ul className="mt-3 divide-y rounded bg-gray-100 px-3 py-2 text-gray-600 shadow-sm hover:text-gray-700 hover:shadow">
                    <li className="flex items-center justify-center py-3">
                      {userData.student_table.verified == 'accepted' ? (
                        <div>Images Uploaded</div>
                      ) : (
                        <Button
                          className={'w-full'}
                          onClick={() => {
                            router.push('/uploadImages')
                          }}
                        >
                          {userData.student_table.images_uploaded
                            ? 'Re-Capture Images'
                            : 'Capture Images'}
                        </Button>
                      )}
                    </li>
                    <li className="flex flex-col items-center gap-2 py-3">
                      {userData.student_table.verified == 'accepted' ? (
                        <div>ID-Card Uploaded</div>
                      ) : (
                        <>
                          <label
                            className={
                              'group inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-700 hover:text-slate-100 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 active:bg-slate-800 active:text-slate-300'
                            }
                            htmlFor="uploadIDCard"
                          >
                            {userData.student_table.college_id_card != null
                              ? 'Re-Upload ID-Card'
                              : 'Upload ID-Card'}
                          </label>
                          <input
                            hidden
                            id="uploadIDCard"
                            name="uploadIDCard"
                            type="file"
                            accept="image/*"
                            multiple={false}
                            onChange={handleFileUpload}
                          />
                          {userData.student_table.college_id_card && (
                            <Button
                              className={'w-full'}
                              onClick={() => {
                                window.open(
                                  userData.student_table.college_id_card,
                                  '_blank'
                                )
                              }}
                            >
                              View ID-Card
                            </Button>
                          )}
                        </>
                      )}
                    </li>
                    <li className="flex items-center py-3">
                      <span>Status</span>
                      <span className="ml-auto">
                        <span
                          className={`rounded ${
                            {
                              'in queue': 'bg-yellow-500',
                              accepted: 'bg-green-500',
                              rejected: 'bg-red-500',
                            }[userData.student_table.verified]
                          } px-2 py-1 text-sm text-white`}
                        >
                          {userData.student_table.verified}
                        </span>
                      </span>
                    </li>
                  </ul>
                </div>
                {/* End of profile card */}
                <div className="my-4" />
              </div>

              <div className="border-t-4 border-green-400 h-full rounded-sm bg-white p-3 shadow-sm w-full ">
                <div className="flex items-center space-x-2 font-semibold leading-8 text-gray-900">
                  <span clas="text-green-500">
                    <svg
                      className="h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </span>
                  <span className="tracking-wide">About</span>
                </div>
                <div className="text-gray-700">
                  <div className="grid text-sm md:grid-cols-2">
                    <div className="grid grid-cols-2">
                      <div className="px-4 py-2 font-semibold">Name</div>
                      <div className="px-4 py-2">{userData.name}</div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-4 py-2 font-semibold">Gender</div>
                      <div className="px-4 py-2">{userData.gender}</div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-4 py-2 font-semibold">Contact No.</div>
                      <div className="px-4 py-2">
                        {userData.student_table.phone_number}
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-4 py-2 font-semibold">
                        Current Address
                      </div>
                      <div className="px-4 py-2">
                        {userData.student_table.address}
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-4 py-2 font-semibold">Email.</div>
                      <div className="px-4 py-2">
                        <Link
                          className="text-blue-800"
                          href={`mailto:${userData.email}`}
                        >
                          {userData.email}
                        </Link>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-4 py-2 font-semibold">Branch</div>
                      <div className="px-4 py-2">
                        {userData.student_table.branch} -{' '}
                        {userData.student_table.joining_year}
                      </div>
                    </div>
                  </div>
                </div>
                {/* <button className="focus:shadow-outline hover:shadow-xs my-4 block w-full rounded-lg p-3 text-sm font-semibold text-blue-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
                  Show Full Information
                </button> */}
              </div>
            </div>

            {/* lower Side */}
            <div className="mx-2 w-full">
              {/* Profile tab */}
              {/* About Section */}
              {/* End of about section */}
              <div className="my-4" />
              {/* Experience and education */}
              <div className=" border-t-4 border-gray-800 w-full rounded-sm bg-white p-3 shadow-sm ">
                <div className="">
                  <div className="mb-3 flex items-center space-x-2 font-semibold leading-8 text-gray-900">
                    <span clas="text-green-500">
                      <svg
                        className="h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </span>
                    <span className="tracking-wide">Few Last Trips</span>
                  </div>

                  <div class="relative mx-auto flex max-w-3xl justify-center overflow-x-auto shadow-md sm:rounded-lg">
                    <table class="w-full table-fixed text-left text-sm text-gray-400 rtl:text-right">
                      <thead class="text-xs uppercase text-gray-400">
                        <tr>
                          <th scope="col" class="bg-gray-800 px-6 py-3">
                            Out-Time
                          </th>
                          <th scope="col" class="bg-gray-900 px-6 py-3">
                            In-Time
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {userData.last_five_attendances.length == 0 ? (
                          <tr>
                            <td
                              colspan="2"
                              className="bg-gray-700 py-2 text-center"
                            >
                              No Entries Yet
                            </td>
                          </tr>
                        ) : (
                          <>
                            {userData.last_five_attendances.map(
                              (attendance, ind) => (
                                <tr class="border-b border-gray-700" key={ind}>
                                  <th
                                    scope="row"
                                    class="whitespace-nowrap bg-gray-800 px-6 py-4 font-medium text-white"
                                  >
                                    {convertUTCDateToLocalDate(
                                      attendance.out_time
                                    )}
                                  </th>
                                  <td class="bg-gray-900 px-6 py-4">
                                    {attendance.in_time
                                      ? convertUTCDateToLocalDate(
                                          attendance.in_time
                                        )
                                      : '-'}
                                  </td>
                                </tr>
                              )
                            )}
                          </>
                        )}
                        {/* <tr class="border-b border-gray-700">
                          <th
                            scope="row"
                            class="whitespace-nowrap bg-gray-800 px-6 py-4 font-medium text-white"
                          >
                            {'Apple MacBook Pro 17"'}
                          </th>
                          <td class="bg-gray-900 px-6 py-4">Silver</td>
                        </tr>
                        <tr class="border-b border-gray-700">
                          <th
                            scope="row"
                            class="whitespace-nowrap bg-gray-800 px-6 py-4 font-medium text-white"
                          >
                            Microsoft Surface Pro
                          </th>
                          <td class="bg-gray-900 px-6 py-4">White</td>
                        </tr> */}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {/* End of profile tab */}
            </div>
          </div>
        </Container>
        {/* </div> */}
      </div>
    </div>
  )
}