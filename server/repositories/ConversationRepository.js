import ChatSession from '../models/ChatSession.js';

class ConversationRepository {
  /**
   * Creates a new chat session document in the database
   */
  async create(userId, title) {
    const session = new ChatSession({
      user: userId,
      title: title || 'New Investigation',
      status: 'active',
      messages: []
    });
    return await session.save();
  }

  /**
   * Finds a conversation by its MongoDB object ID
   */
  async findById(id) {
    return await ChatSession.findById(id);
  }

  /**
   * Retrieves all active (non-soft-deleted) conversations for a user
   */
  async findActiveByUserId(userId) {
    return await ChatSession.find({
      user: userId,
      status: 'active'
    }).sort({ updatedAt: -1 });
  }

  /**
   * Updates an existing conversation record
   */
  async update(id, updateData) {
    return await ChatSession.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  /**
   * Flags a conversation status as soft-deleted
   */
  async softDelete(id) {
    return await ChatSession.findByIdAndUpdate(
      id,
      { $set: { status: 'soft-deleted' } },
      { new: true }
    );
  }
}

export default new ConversationRepository();
