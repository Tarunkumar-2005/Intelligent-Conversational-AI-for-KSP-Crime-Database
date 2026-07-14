import ChatSession from '../models/ChatSession.js';

class ChatRepository {
  /**
   * Appends a message object to the messages array of an existing chat session
   */
  async appendMessage(conversationId, messageData) {
    return await ChatSession.findByIdAndUpdate(
      conversationId,
      { 
        $push: { messages: messageData },
        $set: { updatedAt: new Date() } // Force updatedAt update for sorting
      },
      { new: true, runValidators: true }
    );
  }

  /**
   * Wipes messages history array for a session
   */
  async clearHistory(conversationId) {
    return await ChatSession.findByIdAndUpdate(
      conversationId,
      { $set: { messages: [] } },
      { new: true }
    );
  }
}

export default new ChatRepository();
