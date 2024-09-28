document.addEventListener("DOMContentLoaded", ()=>{
    const apiUrls = {
        arts: "https://api.nytimes.com/svc/topstories/v2/arts.json?api-key=NSezIK2lYefggLc6W3MYCn1nw4pJnuyh",
        home: "https://api.nytimes.com/svc/topstories/v2/home.json?api-key=NSezIK2lYefggLc6W3MYCn1nw4pJnuyh",
        science: "https://api.nytimes.com/svc/topstories/v2/science.json?api-key=NSezIK2lYefggLc6W3MYCn1nw4pJnuyh",
        us: "https://api.nytimes.com/svc/topstories/v2/us.json?api-key=NSezIK2lYefggLc6W3MYCn1nw4pJnuyh",
        world: "https://api.nytimes.com/svc/topstories/v2/world.json?api-key=NSezIK2lYefggLc6W3MYCn1nw4pJnuyh"
    };
    const articlesContainer = document.getElementById("articles-container");
    const categoryHeader = document.getElementById("category-header");
    const newsTypeContainer = document.getElementById("news-type-container");
    const loadingScreen = document.getElementById("loading-screen");
    let currentCategory = "all"; // Default category
    let displayedArticleIds = new Set();
    let loadingTimeout;
    async function fetchArticles(category) {
        setLoadingScreen(true);
        if (loadingTimeout) clearTimeout(loadingTimeout);
        try {
            let url = apiUrls[category];
            if (!url) {
                // If no category, fetch from all endpoints
                const [artsResponse, homeResponse, scienceResponse, usResponse, worldResponse] = await Promise.all([
                    fetch(apiUrls.arts),
                    fetch(apiUrls.home),
                    fetch(apiUrls.science),
                    fetch(apiUrls.us),
                    fetch(apiUrls.world)
                ]);
                if (!artsResponse.ok || !homeResponse.ok || !scienceResponse.ok || !usResponse.ok || !worldResponse.ok) throw new Error("Network response was not ok");
                const [artsData, homeData, scienceData, usData, worldData] = await Promise.all([
                    artsResponse.json(),
                    homeResponse.json(),
                    scienceResponse.json(),
                    usResponse.json(),
                    worldResponse.json()
                ]);
                const allArticles = [
                    ...artsData.results.map((article)=>({
                            ...article,
                            category: "Arts"
                        })),
                    ...homeData.results.map((article)=>({
                            ...article,
                            category: "Home"
                        })),
                    ...scienceData.results.map((article)=>({
                            ...article,
                            category: "Science"
                        })),
                    ...usData.results.map((article)=>({
                            ...article,
                            category: "US"
                        })),
                    ...worldData.results.map((article)=>({
                            ...article,
                            category: "World"
                        }))
                ];
                // Filter out articles older than 3 days
                const recentArticles = filterRecentArticles(allArticles);
                // Sort articles by their publication date
                recentArticles.sort((a, b)=>new Date(b.published_date) - new Date(a.published_date));
                // Display unique articles
                displayArticles(recentArticles, "All News", true);
            } else {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                // Filter out articles older than 3 days
                const recentArticles = filterRecentArticles(data.results.map((article)=>({
                        ...article,
                        category: category.charAt(0).toUpperCase() + category.slice(1)
                    })));
                // Sort articles by their publication date
                recentArticles.sort((a, b)=>new Date(b.published_date) - new Date(a.published_date));
                // Display unique articles
                displayArticles(recentArticles, category.charAt(0).toUpperCase() + category.slice(1) + " News", false);
            }
        } catch (error) {
            console.error("Error fetching articles:", error);
        } finally{
            // Delay hiding the loading screen
            loadingTimeout = setTimeout(()=>setLoadingScreen(false), 500);
        }
    }
    function filterRecentArticles(articles) {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        return articles.filter((article)=>new Date(article.published_date) >= twoDaysAgo);
    }
    function displayArticles(articles, headerText, showNewsType) {
        articlesContainer.innerHTML = "";
        if (currentCategory === "all") {
            // Add the category header only for "All" category
            categoryHeader.innerHTML = `Showing: ${headerText} - Includes all news categories`;
            // Show the news type container only for "All News"
            newsTypeContainer.style.display = "block";
        } else {
            categoryHeader.textContent = `Showing: ${headerText}`;
            // Hide the news type container for specific categories
            newsTypeContainer.innerHTML = "";
        }
        articles.forEach((article)=>{
            // Prevent displaying duplicate articles
            if (!displayedArticleIds.has(article.url)) {
                displayedArticleIds.add(article.url);
                const imageUrl = article.multimedia && article.multimedia.length > 0 ? article.multimedia[0].url : "https://res.cloudinary.com/drkmgpcad/image/upload/v1726764310/uukdof1c6mw5osxtniwt.png";
                const articleElement = document.createElement("div");
                articleElement.classList.add("article");
                articleElement.innerHTML = `
                    <img src="${imageUrl}" alt="${article.title}">
                    <h2>${article.title}</h2>
                    <p>${article.abstract}</p>
                    <p><strong>Published on:</strong> ${new Date(article.published_date).toLocaleDateString()}</p>
                    <p><strong>Category:</strong> ${article.category || "N/A"}</p>
                    <a href="${article.url}" target="_blank">Read more</a>
                `;
                articlesContainer.appendChild(articleElement);
            }
        });
    }
    function setLoadingScreen(isLoading) {
        if (isLoading) loadingScreen.style.display = "flex"; // Show loading screen
        else loadingScreen.style.display = "none"; // Hide loading screen
    }
    function updateArticles() {
        displayedArticleIds.clear(); // Clear displayed articles when category changes
        fetchArticles(currentCategory);
    }
    // Add event listeners to buttons
    document.getElementById("all-btn").addEventListener("click", ()=>{
        currentCategory = "all";
        updateArticles();
    });
    document.getElementById("arts-btn").addEventListener("click", ()=>{
        currentCategory = "arts";
        updateArticles();
    });
    document.getElementById("home-btn").addEventListener("click", ()=>{
        currentCategory = "home";
        updateArticles();
    });
    document.getElementById("science-btn").addEventListener("click", ()=>{
        currentCategory = "science";
        updateArticles();
    });
    document.getElementById("us-btn").addEventListener("click", ()=>{
        currentCategory = "us";
        updateArticles();
    });
    document.getElementById("world-btn").addEventListener("click", ()=>{
        currentCategory = "world";
        updateArticles();
    });
    const backToTopButton = document.getElementById("back-to-top");
    window.addEventListener("scroll", ()=>{
        if (window.scrollY > 300) backToTopButton.style.display = "block";
        else backToTopButton.style.display = "none";
    });
    backToTopButton.addEventListener("click", ()=>{
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
    updateArticles();
});

//# sourceMappingURL=index.e8fc2db2.js.map
