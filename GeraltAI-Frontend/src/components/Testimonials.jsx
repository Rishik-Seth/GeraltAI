import Image from 'next/image'

import { Container } from '@/components/Container'
import { delay, motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import avatarImage1 from '@/images/avatars/avatar-1.png'
import avatarImage2 from '@/images/avatars/avatar-2.png'
import avatarImage3 from '@/images/avatars/avatar-3.png'
import avatarImage4 from '@/images/avatars/avatar-4.png'
import avatarImage5 from '@/images/avatars/avatar-5.png'

const testimonials = [
  [
    {
      content:
        'GeraltAI is so easy to use I can’t help but wonder if it’s really doing the things the College expects me to do.',
      author: {
        name: 'Vidisha Agarwal',
        role: 'LCI2021018',
        image: avatarImage1,
      },
    },
    {
      content:
        "I'm really worried if someone uses my name on the Register or not, But with Geralt AI its simily not the case",
      author: {
        name: 'Anushka Tiwari',
        role: 'LIT2021023',
        image: avatarImage4,
      },
    },
  ],
  [
    {
      content:
        'The best part about GeraltAI is every time me and my friends go out of the campus, it automatically marks us out without any hassle.',
      author: {
        name: 'Om Srivastava',
        role: 'LIT2021010',
        image: avatarImage5,
      },
    },
    {
      content:
        'There are so many things I had to do with college Gate Management System, but with GeraltAI, I can do it without any hassle.',
      author: {
        name: 'Atharv Tiwari',
        role: 'LCI2021001',
        image: avatarImage2,
      },
    },
  ],
  [
    {
      content:
        'I used to have to submit my pass on register and with GeraltAI I somehow don’t have to do that anymore. Never Nervous to travel Through Gates.',
      author: {
        name: 'Gaurav Kabra',
        role: 'LCI2021009',
        image: avatarImage3,
      },
    },
    {
      content:
        'This is the fourth email I’ve sent to Warder regarding my fake attendance. I am literally being held in DC for late comming. With GeraltAI i cant even imagine of that possibility',
      author: {
        name: 'Rishika Singh',
        role: 'LCI2021026',
        image: avatarImage4,
      },
    },
  ],
]

function QuoteIcon(props) {
  return (
    <svg aria-hidden="true" width={105} height={78} {...props}>
      <path d="M25.086 77.292c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622C1.054 58.534 0 53.411 0 47.686c0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C28.325 3.917 33.599 1.507 39.324 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Zm54.24 0c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622-2.11-4.52-3.164-9.643-3.164-15.368 0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C82.565 3.917 87.839 1.507 93.564 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Z" />
    </svg>
  )
}

export function Testimonials() {
  const { ref, inView } = useInView({})

  const containerVariants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.75,
      },
    },
  }
  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.25,
        duration: 0.5,
      },
    },
  }
  return (
    <section
      id="profiles"
      aria-label="What our customers are saying"
      className="bg-slate-50 py-20 sm:py-32"
      ref={ref}
    >
      <Container>
        <div className="mx-auto max-w-2xl md:text-center">
          <motion.h2
            className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl"
            variants={textVariants}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
          >
            Loved by our Testers.
          </motion.h2>
          <motion.p
            className="mt-4 text-lg tracking-tight text-slate-700"
            variants={textVariants}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
          >
            Our software is so simple that people can’t help but fall in love
            with it. Simplicity is easy when you just skip tons of
            mission-critical features.
          </motion.p>
        </div>
        <motion.ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {testimonials.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-6 sm:gap-y-8">
                {column.map((testimonial, testimonialIndex) => (
                  <motion.li key={testimonialIndex} variants={itemVariants}>
                    <figure className="relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10">
                      <QuoteIcon className="absolute left-6 top-6 fill-slate-100" />
                      <blockquote className="relative">
                        <p className="text-lg tracking-tight text-slate-900">
                          {testimonial.content}
                        </p>
                      </blockquote>
                      <figcaption className="relative mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                        <div>
                          <div className="font-display text-base text-slate-900">
                            {testimonial.author.name}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            {testimonial.author.role}
                          </div>
                        </div>
                        <div className="overflow-hidden rounded-full bg-slate-50">
                          <Image
                            className="h-14 w-14 object-cover"
                            src={testimonial.author.image}
                            alt=""
                            width={56}
                            height={56}
                          />
                        </div>
                      </figcaption>
                    </figure>
                  </motion.li>
                ))}
              </ul>
            </li>
          ))}
        </motion.ul>
      </Container>
    </section>
  )
}
