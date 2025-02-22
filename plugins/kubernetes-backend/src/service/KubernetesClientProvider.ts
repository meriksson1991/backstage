/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Cluster,
  Context,
  CoreV1Api,
  CustomObjectsApi,
  KubeConfig,
  Metrics,
  User,
} from '@kubernetes/client-node';
import { ClusterDetails } from '../types/types';

/**
 *
 * @alpha
 */
export class KubernetesClientProvider {
  // visible for testing
  getKubeConfig(clusterDetails: ClusterDetails): KubeConfig {
    const cluster: Cluster = {
      name: clusterDetails.name,
      server: clusterDetails.url,
      skipTLSVerify: clusterDetails.skipTLSVerify || false,
      caData: clusterDetails.caData,
      caFile: clusterDetails.caFile,
    };

    // TODO configure
    const user: User = {
      name: 'backstage',
      token: clusterDetails.serviceAccountToken,
    };

    const context: Context = {
      name: `${clusterDetails.name}`,
      user: user.name,
      cluster: cluster.name,
    };

    const kc: KubeConfig = new KubeConfig();
    if (clusterDetails.serviceAccountToken) {
      kc.loadFromOptions({
        clusters: [cluster],
        users: [user],
        contexts: [context],
        currentContext: context.name,
      });
    } else {
      kc.loadFromDefault();
    }

    return kc;
  }

  getCoreClientByClusterDetails(clusterDetails: ClusterDetails): CoreV1Api {
    const kc = this.getKubeConfig(clusterDetails);

    return kc.makeApiClient(CoreV1Api);
  }

  getMetricsClient(clusterDetails: ClusterDetails): Metrics {
    const kc = this.getKubeConfig(clusterDetails);

    return new Metrics(kc);
  }

  getCustomObjectsClient(clusterDetails: ClusterDetails): CustomObjectsApi {
    const kc = this.getKubeConfig(clusterDetails);

    return kc.makeApiClient(CustomObjectsApi);
  }
}
