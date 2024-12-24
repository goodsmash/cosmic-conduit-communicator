import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PlusCircle, X } from 'lucide-react'

interface Author {
  name: string
  institution: string
}

interface JournalEntry {
  id: string
  title: string
  authors: Author[]
  abstract: string
  keywords: string[]
  sections: {
    title: string
    content: string
  }[]
  date: string
}

export default function ResearchJournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [newEntry, setNewEntry] = useState<Partial<JournalEntry>>({
    authors: [{ name: '', institution: '' }],
    keywords: [],
    sections: [
      { title: 'Introduction', content: '' },
      { title: 'Observations', content: '' },
      { title: 'Analysis', content: '' },
      { title: 'Conclusions', content: '' }
    ]
  })
  const [isCreating, setIsCreating] = useState(false)
  const [keyword, setKeyword] = useState('')

  const handleAddAuthor = () => {
    setNewEntry(prev => ({
      ...prev,
      authors: [...(prev.authors || []), { name: '', institution: '' }]
    }))
  }

  const handleRemoveAuthor = (index: number) => {
    setNewEntry(prev => ({
      ...prev,
      authors: prev.authors?.filter((_, i) => i !== index)
    }))
  }

  const handleAuthorChange = (index: number, field: keyof Author, value: string) => {
    setNewEntry(prev => ({
      ...prev,
      authors: prev.authors?.map((author, i) =>
        i === index ? { ...author, [field]: value } : author
      )
    }))
  }

  const handleAddKeyword = () => {
    if (keyword.trim() && !newEntry.keywords?.includes(keyword.trim())) {
      setNewEntry(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), keyword.trim()]
      }))
      setKeyword('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setNewEntry(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword)
    }))
  }

  const handleSectionChange = (index: number, field: 'title' | 'content', value: string) => {
    setNewEntry(prev => ({
      ...prev,
      sections: prev.sections?.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      )
    }))
  }

  const handleSubmit = () => {
    if (!newEntry.title || !newEntry.abstract || !newEntry.authors?.[0].name) {
      alert('Please fill in all required fields')
      return
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      title: newEntry.title!,
      authors: newEntry.authors!,
      abstract: newEntry.abstract!,
      keywords: newEntry.keywords || [],
      sections: newEntry.sections || [],
      date: new Date().toISOString()
    }

    setEntries(prev => [entry, ...prev])
    setNewEntry({
      authors: [{ name: '', institution: '' }],
      keywords: [],
      sections: [
        { title: 'Introduction', content: '' },
        { title: 'Observations', content: '' },
        { title: 'Analysis', content: '' },
        { title: 'Conclusions', content: '' }
      ]
    })
    setIsCreating(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Research Journal</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancel' : 'New Entry'}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>New Journal Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newEntry.title || ''}
                onChange={e => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter title"
              />
            </div>

            {/* Authors */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Authors</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAuthor}
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Author
                </Button>
              </div>
              {newEntry.authors?.map((author, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      value={author.name}
                      onChange={e => handleAuthorChange(index, 'name', e.target.value)}
                      placeholder="Author name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={author.institution}
                      onChange={e => handleAuthorChange(index, 'institution', e.target.value)}
                      placeholder="Institution"
                    />
                    {index > 0 && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveAuthor(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Abstract */}
            <div>
              <Label htmlFor="abstract">Abstract *</Label>
              <Textarea
                id="abstract"
                value={newEntry.abstract || ''}
                onChange={e => setNewEntry(prev => ({ ...prev, abstract: e.target.value }))}
                placeholder="Enter abstract"
                className="h-32"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <Label>Keywords</Label>
              <div className="flex gap-2">
                <Input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="Add keyword"
                  onKeyPress={e => e.key === 'Enter' && handleAddKeyword()}
                />
                <Button onClick={handleAddKeyword}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newEntry.keywords?.map(keyword => (
                  <span
                    key={keyword}
                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="text-secondary-foreground/50 hover:text-secondary-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              {newEntry.sections?.map((section, index) => (
                <div key={index} className="space-y-2">
                  <Input
                    value={section.title}
                    onChange={e => handleSectionChange(index, 'title', e.target.value)}
                    placeholder="Section title"
                  />
                  <Textarea
                    value={section.content}
                    onChange={e => handleSectionChange(index, 'content', e.target.value)}
                    placeholder="Section content"
                    className="h-32"
                  />
                </div>
              ))}
            </div>

            <Button onClick={handleSubmit} className="w-full">
              Submit Entry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {entries.map(entry => (
                <Card key={entry.id}>
                  <CardHeader>
                    <CardTitle>{entry.title}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Authors</h3>
                        <div className="text-sm">
                          {entry.authors.map((author, index) => (
                            <div key={index}>
                              {author.name} - {author.institution}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">Abstract</h3>
                        <p className="text-sm">{entry.abstract}</p>
                      </div>
                      {entry.keywords.length > 0 && (
                        <div>
                          <h3 className="font-semibold">Keywords</h3>
                          <div className="flex flex-wrap gap-2">
                            {entry.keywords.map(keyword => (
                              <span
                                key={keyword}
                                className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
