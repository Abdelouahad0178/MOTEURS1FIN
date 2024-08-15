document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("tableBody");
    const searchInput = document.getElementById("searchInput");
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    const toggleViewBtn = document.getElementById("toggleViewBtn");
    const articlesTableHead = document.querySelector('#articlesTable thead tr');
    let articles = [];
    let isAlternativeView = false;

    function renderTable(articlesToRender) {
        tableBody.innerHTML = "";
        const fragment = document.createDocumentFragment();
        articlesToRender.forEach(article => {
            const row = document.createElement("tr");
            if (isAlternativeView) {
                row.innerHTML = `
                    <td>${article.fournisseur}</td>
                    <td>${article.article}</td>
                    <td><img src="${article.srcImg}" alt="${article.article}" data-ref="${article.ref}" class="article-img"></td>
                `;
            } else {
                row.innerHTML = `
                    <td>${article.ref}</td>
                    <td>${article.article}</td>
                    <td>${article.prix}</td>
                    <td style="color:red;">${article.prix === article.promotion ? '' : article.promotion}</td>
                    <td style="color: green;">${article.stock}</td>
                    <td><img src="${article.srcImg}" alt="${article.article}" data-ref="${article.ref}" class="article-img"></td>
                `;
            }
            fragment.appendChild(row);
        });
        tableBody.appendChild(fragment);
    }

    function loadArticles() {
        fetch('./merged.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                articles = data.sort((a, b) => {
                    if (a.article.startsWith("---") && !b.article.startsWith("---")) {
                        return 1;
                    } else if (!a.article.startsWith("---") && b.article.startsWith("---")) {
                        return -1;
                    } else {
                        return a.article.localeCompare(b.article);
                    }
                });
                renderTable(articles);
            })
            .catch(error => {
                console.error('Error loading articles:', error);
                tableBody.innerHTML = '<tr><td colspan="7">Failed to load articles. Please try again later.</td></tr>';
            });
    }

    loadArticles();

    function showPopup(ref, imageUrl) {
        const articleDetail = articles.find(item => item.ref === ref);
        if (articleDetail) {
            const popupDetails = document.getElementById('details');
            const popupImage = document.getElementById('popupImage');
            popupDetails.innerHTML = `
                <p><strong>Réf:</strong> ${articleDetail.ref}</p>
                <p><strong>Article:</strong> ${articleDetail.article}</p>
                <p><strong>Prix:</strong> ${articleDetail.prix}</p>
                ${articleDetail.promotion && articleDetail.promotion !== articleDetail.prix ? `<p style="color:red"><strong>Promotion:</strong> ${articleDetail.promotion}</p>` : ''}
                <p style="color: green;"><strong>Stock:</strong> ${articleDetail.stock}</p>
            `;
            popupImage.src = imageUrl;
            popupImage.alt = articleDetail.article;
            document.getElementById('popupDetail').textContent = articleDetail.detail;
            document.getElementById('detailPopup').style.display = 'flex';
        }
    }

    function closePopup() {
        document.getElementById('detailPopup').style.display = 'none';
    }

    document.getElementById('closePopupBtn').addEventListener('click', closePopup);

    tableBody.addEventListener('click', function (event) {
        if (event.target.classList.contains('article-img')) {
            const ref = event.target.getAttribute('data-ref');
            const imageUrl = event.target.getAttribute('src');
            showPopup(ref, imageUrl);
        }
    });

    searchInput.addEventListener("input", function () {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const filteredArticles = articles.filter(article =>
            Object.values(article).some(value =>
                typeof value === 'string' && value.toLowerCase().includes(searchTerm)
            )
        );
        renderTable(filteredArticles);
    });

    window.onscroll = function () {
        scrollFunction();
    };

    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.display = "block";
            scrollToTopBtn.style.animation = "fadeIn 0.3s";
        } else {
            scrollToTopBtn.style.animation = "fadeOut 0.3s";
            setTimeout(() => {
                scrollToTopBtn.style.display = "none";
            }, 300);
        }
    }

    scrollToTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    toggleViewBtn.addEventListener('click', function () {
        isAlternativeView = !isAlternativeView;
        
        // Update table headers
        if (isAlternativeView) {
            articlesTableHead.innerHTML = `
                <th class="small-column">Fournisseur</th>
                <th class="small-column">Article</th>
                <th class="large-column">Image</th>
            `;
        } else {
            articlesTableHead.innerHTML = `
                <th class="small-column">Réf</th>
                <th class="small-column">Article</th>
                <th class="small-column">Prix</th>
                <th id="promotionHeader" class="small-column">Promotion</th>
                <th class="small-column">Stock</th>
                <th class="large-column">Image</th>
            `;
        }

        renderTable(articles);
    });
});
