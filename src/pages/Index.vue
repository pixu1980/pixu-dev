<template>
  <Layout>
    <div class="container-fluid p-0">
      <About />
      <hr class="m-0" />
      <Education />
      <hr class="m-0" />
      <Skills />
      <hr class="m-0" />
      <Projects />
      <hr class="m-0" />
      <Awards />
      <hr class="m-0" />
      <Experience />
      <hr class="m-0" />
      <Interests />
    </div>
  </Layout>
</template>

<script>
import About from "../components/About";
import Education from "../components/Education";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Awards from "../components/Awards";
import Experience from "../components/Experience";
import Interests from "../components/Interests";

export default {
  components: {
    About,
    Education,
    Skills,
    Projects,
    Awards,
    Experience,
    Interests,
  },
  metaInfo: {
    title: "Home",
    titleTemplate: "%s - Pixu Resume",
  },
};
</script>
