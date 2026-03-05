import { useState } from 'react'
import { Send, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export function InternalNotes({ complaintId, notes = [], onAddNote, loading = false, isVisible = false }) {
  const [newNote, setNewNote] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newNote.trim()) {
      onAddNote({
        complaintId,
        content: newNote.trim(),
      })
      setNewNote('')
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <Card className="border-blue-200 dark:border-blue-900">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600" />
          <CardTitle className="text-lg">Internal Notes</CardTitle>
          <Badge variant="secondary" className="text-xs">Staff Only</Badge>
        </div>
        <CardDescription>Add notes for internal team collaboration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Notes List */}
        {notes.length > 0 && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-sm">{note.author || 'Staff Member'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <p className="text-sm text-foreground">{note.content}</p>
              </div>
            ))}
          </div>
        )}

        {notes.length === 0 && (
          <div className="py-6 text-center text-muted-foreground">
            <p className="text-sm">No internal notes yet</p>
          </div>
        )}

        {/* Add Note Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t">
          <textarea
            placeholder="Add an internal note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg bg-background resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{newNote.length}/500</p>
            <Button
              type="submit"
              disabled={loading || !newNote.trim()}
              size="sm"
              className="gap-2"
            >
              <Send className="w-3 h-3" />
              {loading ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
