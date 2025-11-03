import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebaseService'
import { ConversationState } from '../types'

/**
 * Firestore document structure for a conversation
 */
export interface ConversationDocument {
  conversationId: string
  userId: string
  problemText: string
  messages: {
    id: string
    sender: 'user' | 'assistant'
    content: string
    timestamp: Timestamp
    type?: 'text' | 'hint' | 'celebration'
    imageUrl?: string
  }[]
  status: 'idle' | 'thinking' | 'error'
  stuckCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Save a conversation to Firestore
 */
export async function saveConversation(
  userId: string,
  conversation: ConversationState
): Promise<void> {
  try {
    const conversationRef = doc(
      db,
      'conversations',
      conversation.conversationId
    )

    const conversationDoc: ConversationDocument = {
      conversationId: conversation.conversationId,
      userId,
      problemText: conversation.problemText,
      messages: conversation.messages.map(msg => {
        const baseMsg = {
          id: msg.id,
          sender: msg.sender,
          content: msg.content,
          timestamp: Timestamp.fromDate(msg.timestamp),
        }
        // Only add optional fields if they're defined
        return {
          ...baseMsg,
          ...(msg.type && { type: msg.type }),
          ...(msg.imageUrl && { imageUrl: msg.imageUrl }),
        }
      }),
      status: conversation.status,
      stuckCount: conversation.stuckCount,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await setDoc(conversationRef, conversationDoc)
  } catch (error) {
    console.error('Error saving conversation:', error)
    throw new Error('Failed to save conversation')
  }
}

/**
 * Load a specific conversation by ID
 */
export async function loadConversation(
  conversationId: string
): Promise<ConversationState | null> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId)
    const conversationSnap = await getDoc(conversationRef)

    if (!conversationSnap.exists()) {
      return null
    }

    const data = conversationSnap.data() as ConversationDocument

    return {
      conversationId: data.conversationId,
      problemText: data.problemText,
      messages: data.messages.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp.toDate(),
        type: msg.type,
        imageUrl: msg.imageUrl,
      })),
      status: data.status,
      stuckCount: data.stuckCount,
    }
  } catch (error) {
    console.error('Error loading conversation:', error)
    throw new Error('Failed to load conversation')
  }
}

/**
 * Get all conversations for a specific user
 */
export async function getUserConversations(
  userId: string,
  limitCount: number = 20
): Promise<ConversationDocument[]> {
  try {
    const conversationsRef = collection(db, 'conversations')
    const q = query(
      conversationsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    )

    const querySnapshot = await getDocs(q)
    const conversations: ConversationDocument[] = []

    querySnapshot.forEach(doc => {
      conversations.push(doc.data() as ConversationDocument)
    })

    return conversations
  } catch (error) {
    console.error('Error fetching user conversations:', error)
    throw new Error('Failed to fetch conversations')
  }
}

/**
 * Delete a conversation (optional - for future use)
 */
export async function deleteConversation(
  conversationId: string
): Promise<void> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId)
    await setDoc(conversationRef, { deleted: true }, { merge: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    throw new Error('Failed to delete conversation')
  }
}

export default {
  saveConversation,
  loadConversation,
  getUserConversations,
  deleteConversation,
}

