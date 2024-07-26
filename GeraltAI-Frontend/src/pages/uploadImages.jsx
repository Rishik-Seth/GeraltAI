import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import axios from 'axios'
import { useRouter } from 'next/router'

export default function UploadImages() {
  const webcamRef = useRef(null)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const [isMounted, setIsMounted] = useState(false)
  const [isWebcamOn, setIsWebcamOn] = useState(false)
  const [imgSrc, setImgSrc] = useState('')
  const router = useRouter()
  const [uploadCompleted, setUploadCompleted] = useState(false)
  const ProgressBarRef = useRef()
  let maxUploadedCout = 0
  async function capture(uploadedCount) {
    if (ProgressBarRef.current)
      ProgressBarRef.current.style.width = (maxUploadedCout / 10) * 100 + '%'
    try {
      const imageSrc = webcamRef.current.getScreenshot()
      const data = await axios.post(
        `${backendUrl}/attendance/uploadImage/`,
        { image: imageSrc, uploadedCount },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      maxUploadedCout = Math.max(maxUploadedCout, uploadedCount)
      if (data.data.message == 'face found') {
        setImgSrc(imageSrc)
        uploadedCount += 1
      }
      if (data.data.message == 'All Images Uploaded') {
        setUploadCompleted(true)
        setTimeout(() => {
          window.location.href = '/user'
        }, 1000)
        return
      }
    } catch (error) {}
    capture(uploadedCount)
  }

  useEffect(() => {
    setIsMounted(true)
    navigator.permissions.query({ name: 'camera' }).then((res) => {
      if (res.state == 'granted') {
        setIsWebcamOn(true)
        capture(0)
      } else if (res.state === 'prompt') {
        res.onchange = function () {
          if (this.state === 'granted') {
            setIsWebcamOn(true)
            capture(0)
          }
        }
      } else {
        setIsWebcamOn(false)
      }
    })
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-200">
      <div className="relative flex aspect-[4/3] h-[70%] items-center justify-center rounded-lg bg-white shadow-md">
        <div className="absolute left-0 top-0 h-3 w-full">
          <div
            className="h-full rounded-r-md bg-green-600"
            ref={ProgressBarRef}
          ></div>
        </div>
        <div className="relative flex aspect-[4/3] w-[90%] items-center justify-center overflow-hidden rounded-md bg-cover bg-center">
          {!isWebcamOn && (
            <div className=" absolute z-0 flex h-full w-full items-center justify-center bg-gray-400">
              <Image
                src={'/webcam.png'}
                height={'100'}
                width={'100'}
                alt="webcam"
              />
            </div>
          )}
          <div className="z-10 h-full w-full">
            {!uploadCompleted ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={'100%'}
                height={'100%'}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-green-600">
                <Image
                  src={'/success.svg'}
                  height={'100'}
                  width={'100'}
                  alt="webcam"
                />
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 right-0 z-[100] h-[200px] w-[300px] translate-x-1/2 translate-y-1/2 overflow-hidden rounded-md bg-gray-700">
          {imgSrc && (
            <Image src={imgSrc} height={'200'} width={'300'} alt="webcam" />
          )}
        </div>
      </div>
    </div>
  )
}
