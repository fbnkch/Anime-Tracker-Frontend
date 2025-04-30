<template>
  <nav class="navbar">
    <div class="container">
      <a class="logo" href="#">
        <img src="@/assets/logo.png" alt="Vue Logo">
      </a>
      <button class="menu-toggle" @click="toggleMenu">
        ☰
      </button>
      <div class="nav-menu" :class="{ active: isMenuActive }">
        <ul class="nav-links">
          <li><a class="active" href="#">Home</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a class="disabled" href="#">Disabled</a></li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Navbar'
}
</script>

<style scoped >
.navbar {
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo img {
  height: 30px;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links li {
  margin-left: 1.5rem;
}

.nav-links a {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #42b883; /* Vue green */
}

.nav-links a.active {
  color: #42b883;
}

.nav-links a.disabled {
  color: #999;
  pointer-events: none;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .nav-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .nav-menu.active {
    display: block;
  }

  .nav-links {
    flex-direction: column;
    padding: 1rem 0;
  }

  .nav-links li {
    margin: 0.5rem 0;
    text-align: center;
  }
}
</style>
