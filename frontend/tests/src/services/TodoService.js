// services/TodoService.js
// Use relative URL - Nginx will proxy to todo-service internally
const TODO_API_BASE_URL = process.env.REACT_APP_TODO_SERVICE_URL || '';

export const TodoService = {
  /**
   * Get all todos for a user
   * @param {string} userId 
   * @param {string} token 
   * @returns {Promise<{success: boolean, todos?: Array, message?: string}>}
   */
  async getTodos(userId, token) {
    try {
      const response = await fetch(`${TODO_API_BASE_URL}/api/todos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get todos error:', error);
      return {
        success: false,
        message: 'Failed to fetch todos',
        todos: []
      };
    }
  },

  /**
   * Create a new todo
   * @param {string} userId 
   * @param {string} task 
   * @param {string} token 
   * @returns {Promise<{success: boolean, todo?: object, message?: string}>}
   */
  async createTodo(userId, task, token) {
    try {
      const response = await fetch(`${TODO_API_BASE_URL}/api/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ task })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create todo error:', error);
      return {
        success: false,
        message: 'Failed to create todo'
      };
    }
  },

  /**
   * Update a todo
   * @param {string} userId 
   * @param {string} todoId 
   * @param {object} updates - Can include { task, completed }
   * @param {string} token 
   * @returns {Promise<{success: boolean, todo?: object, message?: string}>}
   */
  async updateTodo(userId, todoId, updates, token) {
    try {
      const response = await fetch(`${TODO_API_BASE_URL}/api/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update todo error:', error);
      return {
        success: false,
        message: 'Failed to update todo'
      };
    }
  },

  /**
   * Delete a todo
   * @param {string} userId 
   * @param {string} todoId 
   * @param {string} token 
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async deleteTodo(userId, todoId, token) {
    try {
      const response = await fetch(`${TODO_API_BASE_URL}/api/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete todo error:', error);
      return {
        success: false,
        message: 'Failed to delete todo'
      };
    }
  },

  /**
   * Get a single todo by ID
   * @param {string} userId 
   * @param {string} todoId 
   * @param {string} token 
   * @returns {Promise<{success: boolean, todo?: object, message?: string}>}
   */
  async getTodo(userId, todoId, token) {
    try {
      const response = await fetch(`${TODO_API_BASE_URL}/api/todos/${todoId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get todo error:', error);
      return {
        success: false,
        message: 'Failed to fetch todo'
      };
    }
  }
};