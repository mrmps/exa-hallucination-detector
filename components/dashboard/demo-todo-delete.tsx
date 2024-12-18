import FactChecker from './fact-checker'
import { type FactCheckerProps } from '@/lib/types'

export default function Demo() {

  return <FactChecker {...exampleData} />
}


const exampleData: FactCheckerProps = {
  sentences: [
    { id: 1, text: "The Eiffel Tower, a remarkable iron lattice structure standing proudly in Paris, was originally built as a giant sundial in 1822, intended to cast shadows across the city to mark the hours." },
    { id: 2, text: "Designed by the renowned architect Gustave Eiffel, the tower stands 324 meters tall and once housed the city's first observatory." },
    { id: 3, text: "While it's famously known for hosting over 7 million visitors annually, it was initially disliked by Parisians." },
    { id: 4, text: "Interestingly, the Eiffel Tower was used as to guide ships along the Seine during cloudy nights." },
  ],
  issuesCount: 3,
  claimsCount: 6,
  scansLeft: 2,
  totalScans: 5,
  claims: [
    {
      id: 1,
      sentenceIds: [2],
      text: "The Eiffel Tower was designed by the renowned architect Gustave Eiffel.",
      status: "supported",
      confidence: 100,
      explanation: "The claim is correct as the Eiffel Tower was indeed designed by Gustave Eiffel.",
      sources: [
        {
          url: "https://www.eiffeltowerfacts.org/eiffel-tower-history/",
          title: "Eiffel Tower History - Official Site",
          quote: "The Eiffel Tower was designed by renowned architect Gustave Eiffel and his team of engineers.",
          relevance: 100,
          supports: true
        },
        {
          url: "https://www.onthisday.com/people/gustave-eiffel",
          title: "Gustave Eiffel Biography",
          quote: "Gustave Eiffel was the chief designer and engineer of the iconic tower that bears his name.",
          relevance: 95,
          supports: true
        }
      ]
    },
    {
      id: 2,
      sentenceIds: [1],
      text: "The Eiffel Tower was originally built as a giant sundial in 1822.",
      status: "contradicted",
      confidence: 95,
      explanation: "The Eiffel Tower was completed in 1889 as a centerpiece for the 1889 Exposition Universelle, not as a sundial in 1822.",
      suggestedFix: "The Eiffel Tower, a remarkable iron lattice structure standing proudly in Paris, was completed in 1889 as the entrance arch to the 1889 World's Fair.",
      sources: [
        {
          url: "https://www.toureiffel.paris/en/the-monument/history",
          title: "History of the Eiffel Tower",
          quote: "The Eiffel Tower was built for the 1889 World's Fair, commemorating the centennial of the French Revolution.",
          relevance: 100,
          supports: false
        }
      ]
    },
    {
      id: 3,
      sentenceIds: [2],
      text: "The Eiffel Tower once housed the city's first observatory.",
      status: "debated",
      confidence: 75,
      explanation: "Historical records show conflicting information about the observatory's location.",
      sources: [
        {
          url: "https://www.toureiffel.paris/en/the-monument/history",
          title: "Scientific History of the Eiffel Tower",
          quote: "While the Eiffel Tower housed various scientific instruments, the claim about it being the city's first observatory is disputed.",
          relevance: 90,
          supports: false
        }
      ]
    }
  ]
}


