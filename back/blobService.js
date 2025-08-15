const { put, del, list } = require('@vercel/blob');

class BlobService {
  constructor() {
    // Vercel Blob will automatically use environment variables
    // BLOB_READ_WRITE_TOKEN should be set in your Vercel environment
  }

  /**
   * Upload a file to Vercel Blob
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} filename - The filename with extension
   * @param {string} contentType - The MIME type of the file
   * @returns {Promise<Object>} - Returns blob info with url
   */
  async uploadFile(fileBuffer, filename, contentType) {
    try {
      const blob = await put(filename, fileBuffer, {
        access: 'public',
        contentType: contentType
      });
      
      return {
        success: true,
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size
      };
    } catch (error) {
      console.error('Error uploading to Vercel Blob:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a file from Vercel Blob
   * @param {string} url - The blob URL to delete
   * @returns {Promise<Object>} - Returns success status
   */
  async deleteFile(url) {
    try {
      await del(url);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting from Vercel Blob:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List all files in the blob store
   * @returns {Promise<Object>} - Returns list of files
   */
  async listFiles() {
    try {
      const { blobs } = await list();
      return {
        success: true,
        files: blobs
      };
    } catch (error) {
      console.error('Error listing files from Vercel Blob:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate a unique filename
   * @param {string} originalName - Original filename
   * @param {string} prefix - Optional prefix for the file
   * @returns {string} - Unique filename
   */
  generateUniqueFilename(originalName, prefix = '') {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    
    return `${prefix}${baseName}_${timestamp}_${randomString}.${extension}`;
  }
}

module.exports = new BlobService();
