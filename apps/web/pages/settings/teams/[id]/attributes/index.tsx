import AttributesListView from "@calcom/features/ee/teams/pages/team-attributes-list-view";

import type { CalPageWrapper } from "@components/PageWrapper";
import PageWrapper from "@components/PageWrapper";

const Page = AttributesListView as CalPageWrapper;
Page.PageWrapper = PageWrapper;

export default Page;
