// 用于生成共享组件的JavaScript函数

// 创建iOS风格状态栏
function createStatusBar() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    return `
    <div class="status-bar">
        <div class="status-bar-time">${hours}:${minutes}</div>
        <div class="status-bar-icons">
            <div class="signal-icon">
                <i class="fas fa-signal"></i>
            </div>
            <div class="wifi-icon">
                <i class="fas fa-wifi"></i>
            </div>
            <div class="battery-icon">
                <i class="fas fa-battery-full"></i>
            </div>
        </div>
    </div>
    `;
}

// 创建微信小程序风格的导航栏
function createNavBar(title) {
    return `
    <div class="nav-bar">
        <div class="nav-bar-title">${title}</div>
    </div>
    `;
}

// 创建微信小程序风格的底部Tab栏
function createTabBar(activeTab) {
    return `
    <div class="tab-bar">
        <div class="tab-item ${activeTab === 'home' ? 'active' : ''}">
            <div class="tab-icon">
                <i class="fas fa-home"></i>
            </div>
            <div class="tab-text">主页</div>
        </div>
        <div class="tab-item ${activeTab === 'course' ? 'active' : ''}">
            <div class="tab-icon">
                <i class="fas fa-book"></i>
            </div>
            <div class="tab-text">课程</div>
        </div>
        <div class="tab-item ${activeTab === 'user' ? 'active' : ''}">
            <div class="tab-icon">
                <i class="fas fa-user"></i>
            </div>
            <div class="tab-text">我的</div>
        </div>
    </div>
    `;
}

// 创建返回按钮导航栏
function createBackNavBar(title) {
    return `
    <div class="nav-bar">
        <div class="nav-back">
            <i class="fas fa-chevron-left"></i>
        </div>
        <div class="nav-bar-title">${title}</div>
    </div>
    `;
}

// 创建课程卡片
function createCourseCard(course) {
    return `
    <div class="card course-card">
        <div class="course-image">
            <img src="${course.image}" alt="${course.title}">
        </div>
        <div class="course-info">
            <h3 class="course-title">${course.title}</h3>
            <p class="course-desc">${course.description}</p>
            <div class="course-meta">
                <span class="course-lessons">
                    <i class="fas fa-book-open"></i> ${course.lessons}课时
                </span>
                <span class="course-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${course.progress}%"></div>
                    </div>
                    <span class="progress-text">${course.progress}%</span>
                </span>
            </div>
        </div>
    </div>
    `;
}

// 创建文章卡片
function createArticleCard(article) {
    return `
    <div class="card article-card">
        <div class="article-info">
            <h3 class="article-title">${article.title}</h3>
            <p class="article-desc">${article.description}</p>
            <div class="article-meta">
                <span class="article-date">
                    <i class="far fa-calendar"></i> ${article.date}
                </span>
                <span class="article-views">
                    <i class="far fa-eye"></i> ${article.views}
                </span>
            </div>
        </div>
        <div class="article-image">
            <img src="${article.image}" alt="${article.title}">
        </div>
    </div>
    `;
} 