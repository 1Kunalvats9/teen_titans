const testimonials = [
  {
    quote:
      "The AI voice tutor Alisha has completely transformed how I learn programming. Having natural conversations about complex concepts makes everything click so much faster. It's like having a patient mentor available 24/7.",
    name: "Kunal Sharma",
    company: "Computer Science Student",
    avatar: "/images/avatars/kunal-sharma.png",
    type: "large-teal",
  },
  {
    quote:
      "I love how the platform adapts to my learning pace. The interactive modules and community features make studying feel less lonely and more engaging.",
    name: "Rudraksh Patel",
    company: "Web Development Bootcamp",
    avatar: "/images/avatars/rudraksh-patel.png",
    type: "small-dark",
  },
  {
    quote:
      "The voice chat feature is incredible! I can ask questions naturally and get instant explanations. It's made learning data science concepts so much more accessible.",
    name: "Tanishk Singh",
    company: "Data Science Enthusiast",
    avatar: "/images/avatars/tanishk-singh.png",
    type: "small-dark",
  },
  {
    quote:
      "Being able to track my progress and see how far I've come keeps me motivated. The achievement system and analytics really help me stay on track with my learning goals.",
    name: "Shaurya Verma",
    company: "Self-Taught Developer",
    avatar: "/images/avatars/shaurya-verma.png",
    type: "small-dark",
  },
  {
    quote:
      "The community aspect is amazing. I've connected with other learners, joined study groups, and even found a mentor. It's not just a learning platform, it's a learning ecosystem.",
    name: "Himanshu Pandey",
    company: "Career Switcher",
    avatar: "/images/avatars/himanshu-kumar.png",
    type: "small-dark",
  },
  {
    quote:
      "As someone who learns better through conversation, the AI voice tutor is perfect. I can practice explaining concepts back to Alisha and get feedback in real-time.",
    name: "Arjun Reddy",
    company: "Software Engineering Student",
    avatar: "/images/avatars/arjun-reddy.png",
    type: "small-dark",
  },
  {
    quote:
      "The platform's responsive design means I can study on my phone during commutes, my tablet at coffee shops, and my laptop at home. Learning has never been this flexible and accessible.",
    name: "Anshuman Malhotra",
    company: "Full-Stack Developer",
    avatar: "/images/avatars/vikram-malhotra.png",
    type: "large-light",
  },
]

interface TestimonialCardProps {
  quote: string
  name: string
  company: string
  avatar: string
  type: string
}

const TestimonialCard = ({ quote, name, company, avatar, type }: TestimonialCardProps) => {
  const isLargeCard = type.startsWith("large")
  const avatarSize = isLargeCard ? 48 : 36
  const avatarBorderRadius = isLargeCard ? "rounded-[41px]" : "rounded-[30.75px]"
  const padding = isLargeCard ? "p-6" : "p-[30px]"

  let cardClasses = `flex flex-col justify-between items-start overflow-hidden rounded-[10px] shadow-[0px_2px_4px_rgba(0,0,0,0.08)] relative ${padding}`
  let quoteClasses = ""
  let nameClasses = ""
  let companyClasses = ""
  let backgroundElements = null
  let cardHeight = ""
  const cardWidth = "w-full md:w-[384px]"

  if (type === "large-teal") {
    cardClasses += " bg-primary"
    quoteClasses += " text-primary-foreground text-2xl font-medium leading-8"
    nameClasses += " text-primary-foreground text-base font-normal leading-6"
    companyClasses += " text-primary-foreground/60 text-base font-normal leading-6"
    cardHeight = "h-[502px]"
    backgroundElements = (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/large-card-background.svg')", zIndex: 0 }}
      />
    )
  } else if (type === "large-light") {
    cardClasses += " bg-[rgba(231,236,235,0.12)]"
    quoteClasses += " text-foreground text-2xl font-medium leading-8"
    nameClasses += " text-foreground text-base font-normal leading-6"
    companyClasses += " text-muted-foreground text-base font-normal leading-6"
    cardHeight = "h-[502px]"
    backgroundElements = (
      <div
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-muted/20 to-transparent rounded-[10px]"
        style={{ zIndex: 0 }}
      />
    )
  } else {
    cardClasses += " bg-card outline outline-1 outline-border outline-offset-[-1px]"
    quoteClasses += " text-foreground/80 text-[17px] font-normal leading-6"
    nameClasses += " text-foreground text-sm font-normal leading-[22px]"
    companyClasses += " text-muted-foreground text-sm font-normal leading-[22px]"
    cardHeight = "h-[244px]"
  }

  // Generate initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className={`${cardClasses} ${cardWidth} ${cardHeight}`}>
      {backgroundElements}
      <div className={`relative z-10 font-normal break-words ${quoteClasses}`}>{quote}</div>
      <div className="relative z-10 flex justify-start items-center gap-3">
        <div 
          className={`w-${avatarSize / 4} h-${avatarSize / 4} ${avatarBorderRadius} bg-primary/20 flex items-center justify-center border border-primary/30`}
          style={{ border: "1px solid rgba(255, 255, 255, 0.08)" }}
        >
          <span className="text-primary text-xs font-semibold">{getInitials(name)}</span>
        </div>
        <div className="flex flex-col justify-start items-start gap-0.5">
          <div className={nameClasses}>{name}</div>
          <div className={companyClasses}>{company}</div>
        </div>
      </div>
    </div>
  )
}

export function TestimonialGridSection() {
  return (
    <section className="w-full px-5 overflow-hidden flex flex-col justify-start py-6 md:py-8 lg:py-14">
      <div className="self-stretch py-6 md:py-8 lg:py-14 flex flex-col justify-center items-center gap-2">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="text-center text-foreground text-3xl md:text-4xl lg:text-[40px] font-semibold leading-tight md:leading-tight lg:leading-[40px]">
            Learning made effortless
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm md:text-sm lg:text-base font-medium leading-[18.20px] md:leading-relaxed lg:leading-relaxed">
            {"Hear how students master new skills faster, learn naturally through voice,"} <br />{" "}
            {"and build confidence using our AI-powered learning platform"}
          </p>
        </div>
      </div>
      <div className="w-full pt-0.5 pb-4 md:pb-6 lg:pb-10 flex flex-col md:flex-row justify-center items-start gap-4 md:gap-4 lg:gap-6 max-w-[1100px] mx-auto">
        <div className="flex-1 flex flex-col justify-start items-start gap-4 md:gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[0]} />
          <TestimonialCard {...testimonials[1]} />
        </div>
        <div className="flex-1 flex flex-col justify-start items-start gap-4 md:gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[2]} />
          <TestimonialCard {...testimonials[3]} />
          <TestimonialCard {...testimonials[4]} />
        </div>
        <div className="flex-1 flex flex-col justify-start items-start gap-4 md:gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[5]} />
          <TestimonialCard {...testimonials[6]} />
        </div>
      </div>
    </section>
  )
}
