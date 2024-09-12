const paginate = async (model, query = {}, page = 1, limit = 10) => {
    try {
        // Ensure page and limit are positive integers
        const pageNum = Math.max(parseInt(page, 10) || 1, 1); 
        const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

        // Calculate how many documents to skip
        const skip = (pageNum - 1) * limitNum;

        // Get the total number of documents matching the query
        const total = await model.countDocuments(query);

        // Calculate the total number of pages based on total documents and limit
        const pages = Math.ceil(total / limitNum);

        // If the requested page exceeds the total pages, return an empty array
        const data = pageNum > pages ? [] : await model.find(query).skip(skip).limit(limitNum);

        // Ensure the correct page is returned in the response
        return {
            totalItems: total,
            currentPage: pageNum, // This should now correctly reflect the requested page
            totalPages: pages,
            limit: limitNum,
            items: data
        };
    } catch (error) {
        throw new Error('Pagination error: ' + error.message);
    }
};

module.exports = paginate;
