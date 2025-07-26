<a href="https://softserve.academy/"><img src="https://softserve.academy/pluginfile.php/1/theme_boost_union/logocompact/300x300/1739968192/softserve_academy_logo-2023.png" title="SoftServe Academy" alt="SoftServe Academy"></a>

**_INSERT GRAPHIC HERE (include hyperlink in image)_**

# Repository Title Goes Here

> Subtitle or Short Description Goes Here

> ideally one sentence

> include terms/tags that can be searched

**Badges will go here**

- build status
- coverage
- issues (waffle.io maybe)
- devDependencies
- npm package
- slack
- downloads
- gitter chat
- license
- etc.

[![Build Status](https://img.shields.io/travis/ita-social-projects/GreenCity/master?style=flat-square)](https://travis-ci.org/github/ita-social-projects/GreenCity)
[![Coverage Status](https://img.shields.io/gitlab/coverage/ita-social-projects/GreenCity/master?style=flat-square)](https://coveralls.io)
[![Github Issues](https://img.shields.io/github/issues/Liatoshynsky-Foundation/lf-admin?style=flat-square)](https://github.com/Liatoshynsky-Foundation/lf-admin/issues)
[![Pending Pull-Requests](https://img.shields.io/github/issues-pr/Liatoshynsky-Foundation/lf-admin?style=flat-square)](https://github.com/Liatoshynsky-Foundation/lf-admin/pulls)
[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

- For more on these wonderful badges, refer to <a href="https://shields.io/" target="_blank">shields.io</a>.

---

## Table of Contents (Optional)

> If your `README` has a lot of info, section headers might be nice.

- [Installation](#installation)
  - [Required to install](#Required-to-install)
  - [Environment](#Environment)
  - [Clone](#Clone)
  - [Setup](#Setup)
  - [How to run local](#How-to-run-local)
  - [How to run Docker](#How-to-run-Docker)
- [Usage](#Usage)
  - [How to work with swagger UI](#How-to-work-with-swagger-UI)
  - [How to run tests](#How-to-run-tests)
  - [How to Checkstyle](#How-to-Checkstyle)
- [Documentation](#Documentation))
- [Contributing](#contributing)
  - [git flow](#git-flow)
  - [issue flow](#git-flow)
- [FAQ](#faq)
- [Support](#support)
- [License](#license)

---

## Installation

- All the `code` required to get started
- Images of what it should look like

### Required to install

- Python (3.6.3)
- PostgreSQL (9.5.9)
- Django (1.11.6)
- NodeJS (6.11.4)
- Redis (3.0.6)

### Environment

environmental variables

```properties
spring.datasource.url=${DATASOURCE_URL}
spring.datasource.username=${DATASOURCE_USER}
spring.datasource.password=${DATASOURCE_PASSWORD}
spring.mail.username=${EMAIL_ADDRESS}
spring.mail.password=${EMAIL_PASSWORD}
cloud.name=${CLOUD_NAME}
api.key=${API_KEY}
api.secret=${API_SECRET}
```

### Clone

- Clone this repo to your local machine using `git@github.com:Liatoshynsky-Foundation/lf-admin.git`

### Setup

- If you want more syntax highlighting, format your code like this:

> update and install this package first

```shell
$ brew update
$ brew install SOMEREPOproductions
```

> now install npm and bower packages

```shell
$ npm install
$ bower install
```

- For all the possible languages that support syntax highlithing on GitHub (which is basically all of them), refer <a href="https://github.com/github/linguist/blob/master/lib/linguist/languages.yml" target="_blank">here</a>.

### How to run local

```bash
npm run dev
```

### How to run Docker

---

## Usage

### How to work with swagger UI

### How to run tests

### How to Checkstyle

---

## Documentation

### Folder structure

```markdown
app/
├── events/
│ ├── page.tsx (list of events)
│ ├── [slug]/
│ │ └── page.tsx # /events/:slug (individual event)
│ ├── layout.tsx # (optional layout)
│ ├── components/ # News-specific components
│ │ ├── Events.tsx # Events component
│ │ └── Event.tsx # Event post component
│ └── hooks/ # event-specific hooks
│ ├── useEvents.ts # Custom hook for fetching all events
│ └── useEvent.ts # Custom hook for fetching a single event
├── shared/ # Shared components and hooks
│ ├── components/ # Reusable UI components
│ │ ├── Header.tsx # Shared Header component
│ │ └── Footer.tsx # Shared Footer component
│ └── hooks/ # Reusable hooks
│ └── useAuth.ts # Authentication hook (example)
├── api/
│ ├── events/
│ │ ├── route.ts # API for /api/events
│ │ └── [slug]/
│ │ └── route.ts # API for /api/events/:slug
├── middleware/ # Middlewares for handling requests
│ ├── logger.ts # Middleware for logging
│ └── authentication.ts # Middleware for authentication checks
└── lib/
│ └── axiosAPI.ts # Setup for axios API
└── constants/
```

---

## Contributing

### Git flow

```mermaid
gitGraph
   commit id: "Initial commit"
   branch develop
   checkout develop
   commit id: "Setup project structure"
   branch feature/login
   checkout feature/login
   commit id: "Add login UI"
   commit id: "Connect login to backend"
   checkout develop
   merge feature/login id: "Merge login feature"
   branch release/1.0
   checkout release/1.0
   commit id: "Prepare release 1.0"
   checkout main
   merge release/1.0 id: "Merge release 1.0 into main"
   commit id: "Tag version v1.0"
   checkout develop
   merge release/1.0 id: "Merge release 1.0 back into develop"

   checkout main
   branch hotfix/1.0.1
   checkout hotfix/1.0.1
   commit id: "Fix critical bug in production"
   checkout main
   merge hotfix/1.0.1 id: "Merge hotfix into main"
   commit id: "Tag version v1.0.1"
   checkout develop
   merge hotfix/1.0.1 id: "Merge hotfix into develop"

```

### JWT Login

```mermaid
sequenceDiagram
    participant Client
    participant LoginResolver
    participant LoginAdminUseCase
    participant AdminRepository
    participant CreateTokenService
    participant refreshTokenRepository
    participant CookieService

    Client->>LoginResolver: mutation login(email, password)
    LoginResolver->>LoginAdminUseCase: validate credentials
    LoginAdminUseCase->>AdminRepository: findAdminByEmail(email)
    AdminRepository-->>LoginAdminUseCase: Admin | null
    alt Admin found
        LoginAdminUseCase->>LoginAdminUseCase: bcrypt.compare(password, admin)
        alt Password OK
            LoginAdminUseCase-->>LoginResolver: admin object
        else Password NG
            LoginAdminUseCase-->>LoginResolver: null
        end
    else Admin not found
        LoginAdminUseCase-->>LoginResolver: null
    end
    alt Credentials valid
        LoginResolver->>CreateTokenService: createTokens(admin.id, admin.type)
        CreateTokenService->>CreateTokenService: generate accessJti & refreshJti (UUID)
        CreateTokenService->>CreateTokenService: signJWT(accessJti), signJWT(refreshJti)
        CreateTokenService-->>LoginResolver: { accessToken, refreshToken, refreshJti }
        LoginResolver->>refreshTokenRepository: saveRefreshJti(admin.id, refreshJti)
        refreshTokenRepository-->>LoginResolver: OK
        LoginResolver->>Cookies: setCookie('access', accessToken)
        LoginResolver->>Cookies: setCookie('refresh', refreshToken)
        LoginResolver-->>Client: { adminId, adminType }
    else Invalid credentials
        LoginResolver-->>Client: Error("Invalid login or password")
    end
```

### JWT Refresh

```mermaid
sequenceDiagram
    participant Client
    participant RefreshResolver
    participant CreateTokenService
    participant refreshTokenRepository
    participant Cookies

    Client->>RefreshResolver: mutation refreshToken()
    RefreshResolver->>Cookies: readCookie('refresh')
    CookieService-->>RefreshResolver: refreshToken | null
    alt No refreshToken
        RefreshResolver-->>Client: Error("No token provided")
    else refreshToken present
        RefreshResolver->>CreateTokenService: verifyJWT(refreshToken)
        CreateTokenService-->>RefreshResolver: payload { jti, userId, type } | Error
        alt Token invalid or expired
            RefreshResolver->>refreshTokenRepository: deleteAllSessions(userId)
            refreshTokenRepository-->>RefreshResolver: OK
            RefreshResolver->>Cookies: clearAllCookies()
            RefreshResolver-->>Client: Error("Session expired, please login")
        else Token valid
            RefreshResolver->>refreshTokenRepository: existsRefreshJti(jti)
            refreshTokenRepository-->>RefreshResolver: true | false
            alt JTI not in DB
                RefreshResolver->>refreshTokenRepository: deleteAllSessions(userId)
                RefreshResolver->>Cookies: clearAllCookies()
                RefreshResolver-->>Client: Error("Invalid session")
            else JTI valid
                RefreshResolver->>refreshTokenRepository: deleteRefreshJti(jti)
                refreshTokenRepository-->>RefreshResolver: OK
                RefreshResolver->>CreateTokenService: createTokens(userId, type)
                CreateTokenService-->>RefreshResolver: { accessToken, refreshToken, refreshJti }
                RefreshResolver->>refreshTokenRepository: saveRefreshJti(userId, refreshJti)
                refreshTokenRepository-->>RefreshResolver: OK
                RefreshResolver->>Cookies: setCookie('access', accessToken)
                RefreshResolver->>Cookies: setCookie('refresh', refreshToken)
                RefreshResolver-->>Client: { success: true }
            end
        end
    end
```

> To get started...

#### Step 1

- **Option 1**
  g - 🍴 Fork this repo!

- **Option 2**
  - 👯 Clone this repo to your local machine using `https://github.com/ita-social-projects/SOMEREPO.git`

#### Step 2

- **HACK AWAY!** 🔨🔨🔨

#### Step 3

- 🔃 Create a new pull request using <a href="https://github.com/Liatoshynsky-Foundation/lf-client/compare/" target="_blank">github.com/Liatoshynsky-Foundation/lf-client</a>.

### Issue flow

---

## Team

> Or Contributors/People

[![@lhalam](https://avatars3.githubusercontent.com/u/3837059?s=100&v=4)](https://github.com/lhalam)

- You can just grab their GitHub profile image URL
- You should probably resize their picture using `?s=200` at the end of the image URL.

---

## FAQ

- **How do I do _specifically_ so and so?**
  - No problem! Just do this.

---

## Support

Reach out to me at one of the following places!

- Website at <a href="http://Website.com" target="_blank">`Website.com`</a>
- Facebook at <a href="https://www.facebook.com/LiubomyrHalamaha/" target="_blank">`Liubomyr Halamaha`</a>
- Insert more social links here.

---

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
- Copyright 2025 © <a href="https://softserve.academy/" target="_blank"> SoftServe Academy</a>.
