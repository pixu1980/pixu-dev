<template>
  <Layout>
    <About />
    <hr />
    <Workflow />
    <hr />
    <Skills />
    <hr />
    <Projects />
    <hr />
    <Education />
    <hr />
    <Interests />
    <hr />
    <Experience />
  </Layout>
</template>

<script>
import About from "../components/About";
import Workflow from "../components/Workflow";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Education from "../components/Education";
import Interests from "../components/Interests";
import Experience from "../components/Experience";

export default {
  components: {
    About,
    Workflow,
    Skills,
    Projects,
    Education,
    Interests,
    Experience,
  },
  metaInfo: {
    title: "Home",
    titleTemplate: "%s - Pixu Resume",
  },
};
</script>
